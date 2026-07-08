# SES email identity verification.
# After terraform apply, AWS sends a verification email to from_email.
# Click the link — the identity stays PENDING until you do.
# In SES sandbox mode you can only send to/from verified addresses.
# Request production access once you're ready to go live.

resource "aws_ses_email_identity" "contact" {
  email = var.from_email
}
