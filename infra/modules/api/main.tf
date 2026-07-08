data "aws_caller_identity" "current" {}

# ── IAM: Lambda execution role ────────────────────────────────────────────────

resource "aws_iam_role" "lambda" {
  name = "${var.project}-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_app" {
  name = "app-permissions"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "SESContact"
        Effect = "Allow"
        Action = ["ses:SendEmail"]
        Resource = "*"
        Condition = {
          StringEquals = { "ses:FromAddress" = var.ses_from_email }
        }
      },
      {
        Sid    = "DynamoDB"
        Effect = "Allow"
        Action = ["dynamodb:PutItem", "dynamodb:GetItem", "dynamodb:UpdateItem"]
        Resource = [
          var.analytics_table_arn,
          var.stats_table_arn,
        ]
      },
    ]
  })
}

# ── Lambda packaging (stdlib + boto3 only → no layer needed) ──────────────────

data "archive_file" "contact" {
  type        = "zip"
  source_dir  = "${path.module}/../../../functions/contact"
  output_path = "${path.module}/../../../dist/contact.zip"
}

data "archive_file" "stats" {
  type        = "zip"
  source_dir  = "${path.module}/../../../functions/stats"
  output_path = "${path.module}/../../../dist/stats.zip"
}

data "archive_file" "analytics" {
  type        = "zip"
  source_dir  = "${path.module}/../../../functions/analytics"
  output_path = "${path.module}/../../../dist/analytics.zip"
}

# ── Lambda functions ──────────────────────────────────────────────────────────

resource "aws_lambda_function" "contact" {
  function_name    = "${var.project}-contact"
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.contact.output_path
  source_code_hash = data.archive_file.contact.output_base64sha256
  timeout          = 29  # API Gateway HTTP API max is 30 s
  memory_size      = 128

  environment {
    variables = {
      SES_FROM_EMAIL       = var.ses_from_email
      SES_TO_EMAIL         = var.ses_to_email
      TURNSTILE_SECRET_KEY = var.turnstile_secret_key
      TELEGRAM_BOT_TOKEN   = var.telegram_bot_token
      TELEGRAM_CHAT_ID     = var.telegram_chat_id
      ALLOW_ORIGIN         = var.allow_origin
    }
  }
}

resource "aws_lambda_function" "stats" {
  function_name    = "${var.project}-stats"
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.stats.output_path
  source_code_hash = data.archive_file.stats.output_base64sha256
  timeout          = 15
  memory_size      = 128

  environment {
    variables = {
      STATS_TABLE     = var.stats_table_name
      GITHUB_USERNAME = "mohit-xv"
      GITHUB_TOKEN    = var.github_token
      ALLOW_ORIGIN    = var.allow_origin
    }
  }
}

resource "aws_lambda_function" "analytics" {
  function_name    = "${var.project}-analytics"
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "handler.lambda_handler"
  filename         = data.archive_file.analytics.output_path
  source_code_hash = data.archive_file.analytics.output_base64sha256
  timeout          = 5
  memory_size      = 128

  environment {
    variables = {
      ANALYTICS_TABLE = var.analytics_table_name
      ALLOW_ORIGIN    = var.allow_origin
    }
  }
}

# ── API Gateway HTTP v2 ───────────────────────────────────────────────────────

resource "aws_apigatewayv2_api" "this" {
  name          = "${var.project}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = [var.allow_origin]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 300
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.this.id
  name        = "$default"
  auto_deploy = true
}

# Contact
resource "aws_apigatewayv2_integration" "contact" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.contact.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "contact" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /api/contact"
  target    = "integrations/${aws_apigatewayv2_integration.contact.id}"
}

resource "aws_lambda_permission" "contact_apigw" {
  statement_id  = "AllowAPIGatewayContact"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.contact.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

# Stats
resource "aws_apigatewayv2_integration" "stats" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.stats.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "stats" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "GET /api/stats"
  target    = "integrations/${aws_apigatewayv2_integration.stats.id}"
}

resource "aws_lambda_permission" "stats_apigw" {
  statement_id  = "AllowAPIGatewayStats"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stats.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

# Analytics
resource "aws_apigatewayv2_integration" "analytics" {
  api_id                 = aws_apigatewayv2_api.this.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.analytics.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "analytics" {
  api_id    = aws_apigatewayv2_api.this.id
  route_key = "POST /api/analytics"
  target    = "integrations/${aws_apigatewayv2_integration.analytics.id}"
}

resource "aws_lambda_permission" "analytics_apigw" {
  statement_id  = "AllowAPIGatewayAnalytics"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.analytics.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.this.execution_arn}/*/*"
}

# ── EventBridge: refresh stats cache every 12 hours ───────────────────────────

resource "aws_cloudwatch_event_rule" "stats_refresh" {
  name                = "${var.project}-stats-refresh"
  description         = "Refresh GitHub stats cache in DynamoDB every 12 hours"
  schedule_expression = "rate(12 hours)"
}

resource "aws_cloudwatch_event_target" "stats_refresh" {
  rule = aws_cloudwatch_event_rule.stats_refresh.name
  arn  = aws_lambda_function.stats.arn
}

resource "aws_lambda_permission" "stats_events" {
  statement_id  = "AllowEventBridgeStats"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.stats.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.stats_refresh.arn
}
