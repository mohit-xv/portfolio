variable "project" {
  type = string
}

variable "api_url" {
  description = "API Gateway URL — injected into the Astro build as PUBLIC_API_URL"
  type        = string
}
