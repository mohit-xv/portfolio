variable "project" {
  type = string
}

variable "region" {
  type = string
}

variable "analytics_table_name" {
  type = string
}

variable "analytics_table_arn" {
  type = string
}

variable "stats_table_name" {
  type = string
}

variable "stats_table_arn" {
  type = string
}

variable "ses_from_email" {
  type = string
}

variable "ses_to_email" {
  type = string
}

variable "turnstile_secret_key" {
  type      = string
  sensitive = true
}

variable "telegram_bot_token" {
  type      = string
  sensitive = true
}

variable "telegram_chat_id" {
  type = string
}

variable "github_token" {
  type      = string
  sensitive = true
}

variable "allow_origin" {
  type = string
}
