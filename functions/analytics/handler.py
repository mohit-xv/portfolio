"""
Analytics Lambda — Phase 5.

Cookieless, privacy-first page-view collector.
Hashes IP + UA + day-bucket into a 16-char visitor token — no PII stored, no cookie.
Writes to DynamoDB. Best-effort: never rejects a frontend request on failure.

boto3 is pre-installed in the Lambda Python 3.12 runtime.
"""
import hashlib
import json
import os
import time
import uuid
import boto3

dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "ap-south-1"))

_CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": os.environ.get("ALLOW_ORIGIN", "*"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 204, "headers": _CORS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, TypeError):
        return {"statusCode": 200, "headers": _CORS, "body": json.dumps({"ok": True})}

    page     = (body.get("page")     or "/").strip()[:255]
    referrer = (body.get("referrer") or "").strip()[:500]

    # Cookieless visitor hash: sha256(ip:ua:day) → first 16 hex chars
    source_ip  = event.get("requestContext", {}).get("http", {}).get("sourceIp", "")
    user_agent = event.get("headers",         {}).get("user-agent", "")
    day_bucket = str(int(time.time()) // 86400)
    visitor    = hashlib.sha256(f"{source_ip}:{user_agent}:{day_bucket}".encode()).hexdigest()[:16]

    table = dynamodb.Table(os.environ["ANALYTICS_TABLE"])
    ts_ms = int(time.time() * 1000)

    try:
        table.put_item(Item={
            "page":       page,
            "ts_id":      f"{ts_ms}#{uuid.uuid4().hex[:8]}",
            "referrer":   referrer,
            "visitor":    visitor,
            # DynamoDB TTL is configured on this attribute (epoch seconds) —
            # rows auto-expire after 90 days so the table can't grow unbounded
            "expires_at": int(time.time()) + 90 * 86400,
        })
    except Exception:
        pass  # Best-effort — never fail the frontend

    return {"statusCode": 200, "headers": _CORS, "body": json.dumps({"ok": True})}
