output "role_arn" {
  description = "ARN of the GitHub Actions deploy role — add as DEPLOY_ROLE_ARN in GitHub Actions variables"
  value       = aws_iam_role.github_deploy.arn
}
