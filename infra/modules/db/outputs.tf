output "analytics_table_name" {
  value = aws_dynamodb_table.analytics.name
}

output "analytics_table_arn" {
  value = aws_dynamodb_table.analytics.arn
}

output "stats_table_name" {
  value = aws_dynamodb_table.stats.name
}

output "stats_table_arn" {
  value = aws_dynamodb_table.stats.arn
}
