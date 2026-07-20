from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import requests
import os
import logging
import traceback

logger = logging.getLogger(__name__)

class BrevoAPIError(Exception):
    pass

class InvalidApiKeyError(BrevoAPIError):
    pass

def send_brevo_api_email(to_email, subject, html_content, text_content=""):
    api_key = getattr(settings, 'BREVO_API_KEY', None)
    from_email_raw = getattr(settings, 'DEFAULT_FROM_EMAIL', 'CampusLunch <lunchcampus@gmail.com>')
    
    logger.info("Starting Brevo API email dispatch process...")
    logger.info(f"Recipient: {to_email}")
    logger.info(f"Subject: '{subject}'")
    
    # Parse name and email from DEFAULT_FROM_EMAIL (e.g., "CampusLunch <lunchcampus@gmail.com>")
    from_name = "CampusLunch"
    from_email = "lunchcampus@gmail.com"
    if "<" in from_email_raw and ">" in from_email_raw:
        try:
            from_name, from_email = from_email_raw.split("<", 1)
            from_name = from_name.strip()
            from_email = from_email.split(">", 1)[0].strip()
        except Exception as e:
            logger.warning(f"Failed to parse DEFAULT_FROM_EMAIL: {e}. Using defaults.")
            
    logger.info(f"Parsed Sender: {from_name} <{from_email}>")

    if not api_key:
        logger.error("BREVO_API_KEY is not configured in Django settings.")
        raise InvalidApiKeyError("BREVO_API_KEY is missing or empty.")

    # Mask API key in logs for security
    masked_key = f"{api_key[:8]}...{api_key[-8:]}" if len(api_key) > 16 else "invalid-key"
    logger.info(f"Using API Key: {masked_key}")

    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }
    
    payload = {
        "sender": {
            "name": from_name,
            "email": from_email
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }
    if text_content:
        payload["textContent"] = text_content

    logger.info("Sending HTTP POST request to Brevo API endpoint...")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        logger.info(f"Brevo API response received. Status Code: {response.status_code}")
        
        if response.status_code == 201:
            res_data = response.json()
            logger.info(f"Email successfully sent via Brevo API. Message ID: {res_data.get('messageId')}")
            return res_data
        elif response.status_code in [401, 403]:
            logger.error(f"Authentication failed. Status: {response.status_code}. Response: {response.text}")
            raise InvalidApiKeyError(f"Unauthorized (API key error): {response.text}")
        else:
            logger.error(f"Brevo API returned error. Status: {response.status_code}. Response: {response.text}")
            raise BrevoAPIError(f"Brevo API error: {response.text}")
            
    except (InvalidApiKeyError, BrevoAPIError):
        raise
    except requests.exceptions.Timeout as te:
        logger.error(f"HTTP connection to Brevo API timed out: {str(te)}")
        traceback.print_exc()
        raise BrevoAPIError(f"Brevo API request timed out: {str(te)}")
    except requests.exceptions.RequestException as re:
        logger.error(f"HTTP request to Brevo API failed: {str(re)}")
        traceback.print_exc()
        raise BrevoAPIError(f"Brevo API request failed: {str(re)}")
    except Exception as e:
        logger.error(f"Unexpected error during API email sending: {str(e)}")
        traceback.print_exc()
        raise BrevoAPIError(f"Unexpected error: {str(e)}")

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