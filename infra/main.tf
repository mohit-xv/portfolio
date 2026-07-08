module "db" {
  source  = "./modules/db"
  project = var.project
}

module "ses" {
  source     = "./modules/ses"
  from_email = var.ses_from_email
}

module "api" {
  source = "./modules/api"

  project              = var.project
  region               = var.aws_region
  analytics_table_name = module.db.analytics_table_name
  analytics_table_arn  = module.db.analytics_table_arn
  stats_table_name     = module.db.stats_table_name
  stats_table_arn      = module.db.stats_table_arn
  ses_from_email       = var.ses_from_email
  ses_to_email         = var.ses_to_email
  turnstile_secret_key = var.turnstile_secret_key
  telegram_bot_token   = var.telegram_bot_token
  telegram_chat_id     = var.telegram_chat_id
  github_token         = var.github_token
  allow_origin         = var.allow_origin

  depends_on = [module.db, module.ses]
}

module "site" {
  source   = "./modules/site"
  project  = var.project
  api_url  = module.api.api_url
}

module "oidc" {
  source          = "./modules/oidc"
  project         = var.project
  github_owner    = var.github_owner
  github_repo     = var.github_repo
  s3_bucket_arn   = module.site.bucket_arn
  distribution_id = module.site.distribution_id
}
