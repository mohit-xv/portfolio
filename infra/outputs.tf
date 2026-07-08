output "site_url" {
  description = "CloudFront URL — set PUBLIC_API_URL in GitHub Actions vars after first apply"
  value       = "https://${module.site.cloudfront_domain}"
}

output "api_url" {
  description = "API Gateway base URL — used by the contact form and analytics"
  value       = module.api.api_url
}

output "deploy_role_arn" {
  description = "IAM role ARN for GitHub Actions OIDC — add as DEPLOY_ROLE_ARN Actions variable"
  value       = module.oidc.role_arn
}

output "bucket_name" {
  description = "S3 bucket — add as S3_BUCKET Actions variable"
  value       = module.site.bucket_name
}

output "distribution_id" {
  description = "CloudFront distribution ID — add as CF_DISTRIBUTION_ID Actions variable"
  value       = module.site.distribution_id
}
