variable "aws_region" {
  description = "AWS region for all resources (CloudFront edge locations cover ap-south-1 without needing us-east-1)"
  type        = string
  default     = "ap-south-1"
}

variable "project" {
  description = "Project name prefix — used for all resource names and tags"
  type        = string
  default     = "mohit-portfolio"
}

variable "github_owner" {
  description = "GitHub account owner — used to scope the OIDC trust policy"
  type        = string
  default     = "mohit-xv"
}

variable "github_repo" {
  description = "GitHub repository name"
  type        = string
  default     = "portfolio"
}

variable "ses_from_email" {
  description = "SES verified sender address — must be verified in SES console before deploy"
  type        = string
  default     = "mohitsinghdl2611@gmail.com"
}

variable "ses_to_email" {
  description = "Recipient for contact form emails (same as from in SES sandbox)"
  type        = string
  default     = "mohitsinghdl2611@gmail.com"
}

variable "turnstile_secret_key" {
  description = "Cloudflare Turnstile secret key — get from dash.cloudflare.com/turnstile"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telegram_bot_token" {
  description = "Telegram bot token — create via @BotFather"
  type        = string
  sensitive   = true
  default     = ""
}

variable "telegram_chat_id" {
  description = "Telegram chat ID where contact notifications are sent"
  type        = string
  default     = ""
}

variable "github_token" {
  description = "GitHub personal access token for stats API — avoids 60 req/hr unauthenticated limit"
  type        = string
  sensitive   = true
  default     = ""
}

variable "allow_origin" {
  description = "Allowed CORS origin — set to your CloudFront URL after first apply, then re-apply"
  type        = string
  default     = "*"
}
