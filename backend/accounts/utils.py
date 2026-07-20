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
    logger.info("Entering send_brevo_api_email()")
    api_key = getattr(settings, 'BREVO_API_KEY', None)
    from_email_raw = getattr(settings, 'DEFAULT_FROM_EMAIL', 'CampusLunch <lunchcampus@gmail.com>')
    
    logger.info(f"Arguments: to_email='{to_email}', subject='{subject}'")
    
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

    # Print request details for debugging
    logger.info("Request creation details:")
    logger.info(f"  Endpoint URL: {url}")
    # Mask API key header for logging
    logged_headers = {k: (v if k.lower() != 'api-key' else '***') for k, v in headers.items()}
    logger.info(f"  Headers: {logged_headers}")
    logger.info(f"  Payload: {payload}")

    logger.info("Sending HTTP POST request to Brevo API endpoint...")
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=15)
        logger.info("Brevo API response received.")
        logger.info(f"  Response Status Code: {response.status_code}")
        logger.info(f"  Response Headers: {dict(response.headers)}")
        logger.info(f"  Response Body: {response.text}")
        
        if response.status_code == 201:
            res_data = response.json()
            logger.info(f"Email successfully sent via Brevo API. Message ID: {res_data.get('messageId')}")
            return res_data
        elif response.status_code in [401, 403]:
            err_msg = f"Authentication/Authorization failed. Status: {response.status_code}. Response: {response.text}"
            logger.error(err_msg)
            raise InvalidApiKeyError(err_msg)
        else:
            err_msg = f"Brevo API returned error. Status: {response.status_code}. Response: {response.text}"
            logger.error(err_msg)
            raise BrevoAPIError(err_msg)
            
    except (InvalidApiKeyError, BrevoAPIError) as e:
        logger.error(f"Re-throwing expected exception in send_brevo_api_email: {str(e)}", exc_info=True)
        raise
    except requests.exceptions.Timeout as te:
        err_msg = f"HTTP connection to Brevo API timed out: {str(te)}"
        logger.error(err_msg, exc_info=True)
        raise BrevoAPIError(err_msg)
    except requests.exceptions.RequestException as re:
        err_msg = f"HTTP request to Brevo API failed: {str(re)}"
        logger.error(err_msg, exc_info=True)
        raise BrevoAPIError(err_msg)
    except Exception as e:
        err_msg = f"Unexpected error during API email sending: {str(e)}"
        logger.error(err_msg, exc_info=True)
        raise BrevoAPIError(err_msg)

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
    logger.info("Entering send_otp_email()")
    logger.info(f"Arguments: email_address='{email_address}', otp='{otp}'")
    subject = "Verify Your CampusLunch Email"
    context = {
        "otp": otp,
    }
    html_content = render_to_string(
        "emails/otp_verification.html",
        context,
    )
    logger.info("Calling send_brevo_api_email from send_otp_email...")
    send_brevo_api_email(email_address, subject, html_content, f"Your CampusLunch verification OTP is {otp}.")
    logger.info("Exiting send_otp_email()")