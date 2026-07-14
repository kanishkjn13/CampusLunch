from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import requests
import os
import logging

logger = logging.getLogger(__name__)

class BrevoAPIError(Exception):
    pass

class InvalidApiKeyError(BrevoAPIError):
    pass

def send_brevo_api_email(to_email, subject, html_content, text_content=""):
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if not api_key:
        api_key = os.getenv('BREVO_API_KEY', '')

    if not api_key:
        logger.error("Failed to send email: BREVO_API_KEY is missing or empty.")
        raise InvalidApiKeyError("Brevo API Key is missing. Please check your environment variables.")

    if not api_key.startswith("xkeysib-"):
        logger.warning(f"Warning: BREVO_API_KEY value does not start with 'xkeysib-'. Prefix: '{api_key[:8]}'...")
        print(f"Warning: BREVO_API_KEY value does not start with 'xkeysib-'. Prefix: '{api_key[:8]}'...")

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Campus Lunch <lunchcampus@gmail.com>')
    from_name = "Campus Lunch"
    from_addr = "lunchcampus@gmail.com"
    if " <" in from_email:
        from_name, from_addr = from_email.split(" <")
        from_addr = from_addr.replace(">", "").strip()
        from_name = from_name.strip()

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    payload = {
        "sender": {
            "name": from_name,
            "email": from_addr
        },
        "to": [{
            "email": to_email
        }],
        "subject": subject,
        "htmlContent": html_content
    }
    if text_content:
        payload["textContent"] = text_content

    masked_key = f"{api_key[:8]}...{api_key[-4:]}" if len(api_key) > 12 else "***"
    logger.info(f"Sending email request to Brevo. Recipient: {to_email}. Subject: '{subject}'. API Key Masked: {masked_key}")

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=5)
    except requests.exceptions.RequestException as e:
        logger.error(f"Network error trying to connect to Brevo API: {str(e)}")
        raise BrevoAPIError(f"Network error connecting to email provider: {str(e)}")

    logger.info(f"Brevo API response received. Status Code: {response.status_code}. Response Body: {response.text}")
    print(f"Brevo API response received. Status Code: {response.status_code}. Response Body: {response.text}")

    if response.status_code in [200, 201, 202]:
        logger.info(f"Email successfully dispatched to {to_email} via Brevo HTTP API.")
        return response.json()
    elif response.status_code in [401, 403]:
        logger.error(f"Unauthorized email dispatch attempt. Status: {response.status_code}. Details: {response.text}")
        raise InvalidApiKeyError("Unauthorized: The provided Brevo API Key is invalid or unauthorized.")
    else:
        logger.error(f"Brevo email dispatch failed with status: {response.status_code}. Details: {response.text}")
        raise BrevoAPIError(f"Brevo API error: {response.text}")

def send_password_reset_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = PasswordResetTokenGenerator().make_token(user)
    reset_link = (
        f"{settings.FRONTEND_URL}"
        f"/reset-password/{uid}/{token}"
    )
    subject = "Reset Your CampusLunch Password"
    context = {
        "full_name": user.full_name,
        "reset_link": reset_link,
    }
    html_content = render_to_string(
        "emails/password_reset.html",
        context,
    )
    send_brevo_api_email(user.email, subject, html_content, "Reset your password.")

def send_otp_email(email_address, otp):
    subject = "Verify Your CampusLunch Email"
    context = {
        "otp": otp,
    }
    html_content = render_to_string(
        "emails/otp_verification.html",
        context,
    )
    send_brevo_api_email(email_address, subject, html_content, f"Your CampusLunch verification OTP is {otp}.")