"""
Stats Lambda — Phase 5.

Dual mode:
  - EventBridge schedule → fetches GitHub API → writes to DynamoDB cache.
  - API Gateway GET /api/stats → serves from DynamoDB, falls back to live GitHub if cache is cold.

boto3 and urllib are pre-installed in the Lambda Python 3.12 runtime.
"""
import json
import os
import urllib.request
import boto3

dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "ap-south-1"))

_CORS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": os.environ.get("ALLOW_ORIGIN", "*"),
    "Cache-Control": "public, max-age=3600",
}


def lambda_handler(event, context):
    table = dynamodb.Table(os.environ["STATS_TABLE"])

    # EventBridge trigger → refresh cache and return
    if event.get("source") == "aws.events" or event.get("refresh"):
        stats = _fetch_github()
        table.put_item(Item={"stat_key": "github", **stats})
        return {"statusCode": 200, "headers": _CORS, "body": json.dumps(stats)}

    # API Gateway GET → try cache first
    try:
        resp = table.get_item(Key={"stat_key": "github"})
        item = resp.get("Item", {})
        if item:
            item.pop("stat_key", None)
            return {"statusCode": 200, "headers": _CORS, "body": json.dumps(item)}
    except Exception:
        pass

    # Cache miss — fetch live and populate cache
    stats = _fetch_github()
    try:
        table.put_item(Item={"stat_key": "github", **stats})
    except Exception:
        pass

    return {"statusCode": 200, "headers": _CORS, "body": json.dumps(stats)}


def _fetch_github() -> dict:
    username = os.environ.get("GITHUB_USERNAME", "mohit-xv")
    token    = os.environ.get("GITHUB_TOKEN", "")

    gh_headers = {
        "Accept":               "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        gh_headers["Authorization"] = f"Bearer {token}"

    try:
        user   = _gh_get(f"https://api.github.com/users/{username}", gh_headers)
        events = _gh_get(f"https://api.github.com/users/{username}/events/public?per_page=1", gh_headers)

        last_active = events[0]["created_at"][:10] if events else None

        return {
            "public_repos": user.get("public_repos", 0),
            "followers":    user.get("followers", 0),
            "last_active":  last_active,
            "profile_url":  user.get("html_url", f"https://github.com/{username}"),
        }
    except Exception:
        return {
            "public_repos": 0,
            "followers":    0,
            "last_active":  None,
            "profile_url":  f"https://github.com/{username}",
        }


def _gh_get(url: str, headers: dict):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())
