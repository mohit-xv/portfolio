data "aws_caller_identity" "current" {}

# ── S3 ────────────────────────────────────────────────────────────────────────

resource "aws_s3_bucket" "site" {
  # Include account ID so the name is globally unique without a random suffix
  bucket = "${var.project}-site-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "site" {
  bucket = aws_s3_bucket.site.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ── CloudFront ────────────────────────────────────────────────────────────────

resource "aws_cloudfront_origin_access_control" "site" {
  name                              = "${var.project}-oac"
  description                       = "OAC for ${var.project} — sigv4, always sign"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# ── CloudFront Function — rewrite bare paths to /index.html ──────────────────
# Astro outputs contact/ as contact/index.html. Without this, CloudFront hits S3
# looking for a key named "contact" which doesn't exist → 403 AccessDenied.

resource "aws_cloudfront_function" "url_rewrite" {
  name    = "${var.project}-url-rewrite"
  runtime = "cloudfront-js-2.0"
  comment = "Rewrite bare paths to index.html for Astro static routing"
  publish = true

  code = <<-EOT
    function handler(event) {
      var request = event.request;
      var uri = request.uri;
      if (uri.endsWith('/')) {
        request.uri = uri + 'index.html';
      } else if (!uri.includes('.')) {
        request.uri = uri + '/index.html';
      }
      return request;
    }
  EOT
}

resource "aws_cloudfront_distribution" "site" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  http_version        = "http2and3"
  price_class         = "PriceClass_200" # Covers US, EU, Asia incl. India

  origin {
    domain_name              = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id                = "S3-${var.project}"
    origin_access_control_id = aws_cloudfront_origin_access_control.site.id
  }

  # Default: long-cache for hashed assets (_astro/* has content-hash filenames)
  default_cache_behavior {
    target_origin_id       = "S3-${var.project}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 86400    # 1 day
    max_ttl     = 31536000 # 1 year

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.url_rewrite.arn
    }
  }

  # HTML pages — short cache so a re-deploy is reflected quickly
  ordered_cache_behavior {
    path_pattern           = "*.html"
    target_origin_id       = "S3-${var.project}"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 300   # 5 minutes
    max_ttl     = 3600
  }

  # S3 with OAC returns 403 (not 404) for missing objects — map both to Astro's 404 page
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html" # Astro emits 404 at the root, not /404/index.html
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html" # Astro emits 404 at the root, not /404/index.html
    error_caching_min_ttl = 10
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  # CloudFront default cert — Upgrade 01 (custom domain) adds ACM here
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# OAC bucket policy — CloudFront is the only allowed reader
resource "aws_s3_bucket_policy" "site" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "AllowCloudFrontOAC"
      Effect    = "Allow"
      Principal = { Service = "cloudfront.amazonaws.com" }
      Action    = "s3:GetObject"
      Resource  = "${aws_s3_bucket.site.arn}/*"
      Condition = {
        StringEquals = {
          "AWS:SourceArn" = aws_cloudfront_distribution.site.arn
        }
      }
    }]
  })

  depends_on = [aws_s3_bucket_public_access_block.site]
}
