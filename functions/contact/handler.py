"""
Contact form Lambda — Phase 5.

Flow: validate → honeypot check → Turnstile verify → SES email → Telegram ping.
All HTTP calls use stdlib urllib to avoid packaging external dependencies.
boto3 is pre-installed in the Lambda Python 3.12 runtime.
"""
import json
import os
import urllib.request
import urllib.parse
import boto3

ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "ap-south-1"))

_CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": os.environ.get("ALLOW_ORIGIN", "*"),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

_CONTEXT_LABELS = {
    "role":     "Role / Internship",
    "aws-bill": "AWS bill review",
    "project":  "Project / Collaboration",
    "other":    "Other",
}


def lambda_handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "")
    if method == "OPTIONS":
        return {"statusCode": 204, "headers": _CORS, "body": ""}

    try:
        body = json.loads(event.get("body") or "{}")
    except (json.JSONDecodeError, TypeError):
        return _error(400, "Invalid request body")

    # Honeypot — silently succeed if a bot filled the hidden field
    if body.get("_hp"):
        return _ok()

    name    = (body.get("name")    or "").strip()
    email   = (body.get("email")   or "").strip()
    message = (body.get("message") or "").strip()
    ctx     = (body.get("context") or "").strip()

    if not all([name, email, message, ctx]):
        return _error(400, "Missing required fields")
    if len(name) > 100 or len(email) > 254 or len(ctx) > 50:
        return _error(400, "Field too long")
    if len(message) > 2000:
        return _error(400, "Message too long")
    if "@" not in email or "." not in email.split("@")[-1]:
        return _error(400, "Invalid email address")

    # Turnstile verification (skipped in dev when secret key is absent)
    secret = os.environ.get("TURNSTILE_SECRET_KEY", "")
    if secret:
        token = body.get("cf-turnstile-response", "")
        if not _verify_turnstile(token, secret):
            return _error(400, "Bot verification failed — please try again")

    from_email = os.environ["SES_FROM_EMAIL"]
    to_email   = os.environ["SES_TO_EMAIL"]
    label      = _CONTEXT_LABELS.get(ctx, ctx)
    subject    = f"[Portfolio] {label} from {name}"

    html_body = (
        f"<p><strong>Name:</strong> {_esc(name)}</p>"
        f"<p><strong>Email:</strong> <a href='mailto:{_esc(email)}'>{_esc(email)}</a></p>"
        f"<p><strong>Context:</strong> {label}</p>"
        f"<hr>"
        f"<p>{_esc(message).replace(chr(10), '<br>')}</p>"
    )
    text_body = f"From: {name} <{email}>\nContext: {label}\n\n{message}"

    ses.send_email(
        Source=from_email,
        Destination={"ToAddresses": [to_email]},
        Message={
            "Subject": {"Data": subject, "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": text_body, "Charset": "UTF-8"},
                "Html": {"Data": html_body, "Charset": "UTF-8"},
            },
        },
        ReplyToAddresses=[email],
    )

    # Telegram ping — non-critical, failure doesn't affect the response
    tg_token = os.environ.get("TELEGRAM_BOT_TOKEN", "")
    tg_chat  = os.environ.get("TELEGRAM_CHAT_ID",  "")
    if tg_token and tg_chat:
        _send_telegram(tg_token, tg_chat, f"\U0001f4ec New contact from {name}\n{label}\n{email}")

    return _ok()


def _verify_turnstile(token: str, secret: str) -> bool:
    if not token:
        return False
    payload = urllib.parse.urlencode({"secret": secret, "response": token}).encode()
    req = urllib.request.Request(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        data=payload,
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            return json.loads(resp.read()).get("success", False)
    except Exception:
        return False


def _send_telegram(token: str, chat_id: str, text: str) -> None:
    payload = json.dumps({"chat_id": chat_id, "text": text}).encode()
    req = urllib.request.Request(
        f"https://api.telegram.org/bot{token}/sendMessage",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        urllib.request.urlopen(req, timeout=5)
    except Exception:
        pass  # Non-critical — email is already sent


def _esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _ok() -> dict:
    return {"statusCode": 200, "headers": _CORS, "body": json.dumps({"ok": True})}


def _error(status: int, message: str) -> dict:
    return {"statusCode": status, "headers": _CORS, "body": json.dumps({"ok": False, "error": message})}
