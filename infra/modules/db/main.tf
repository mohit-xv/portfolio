# DynamoDB tables — both on PAY_PER_REQUEST (on-demand) billing.
# At our traffic levels these stay within the 25 GB / 25 WCU / 25 RCU free tier.

resource "aws_dynamodb_table" "analytics" {
  name         = "${var.project}-analytics"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "page"
  range_key    = "ts_id"

  attribute {
    name = "page"
    type = "S"
  }

  attribute {
    name = "ts_id"
    type = "S"
  }

  # TTL — auto-expire old analytics after 90 days to keep the table lean
  ttl {
    attribute_name = "expires_at"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "stats" {
  name         = "${var.project}-stats"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "stat_key"

  attribute {
    name = "stat_key"
    type = "S"
  }
}
