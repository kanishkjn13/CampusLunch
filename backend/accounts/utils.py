from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from django.core.mail import EmailMultiAlternatives
import requests
import os
import logging

logger = logging.getLogger(__name__)

class BrevoAPIError(Exception):
    pass

class InvalidApiKeyError(BrevoAPIError):
    pass

def send_brevo_api_email(to_email, subject, html_content, text_content=""):
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'Campus Lunch <lunchcampus@gmail.com>')
    logger.info(f"Sending email via Django SMTP to {to_email}. Subject: '{subject}'")
    try:
        msg = EmailMultiAlternatives(subject, text_content, from_email, [to_email])
        msg.attach_alternative(html_content, "text/html")
        msg.send()
        logger.info(f"Email successfully dispatched to {to_email} via SMTP.")
        return {"message": "Email sent"}
    except Exception as e:
        logger.error(f"SMTP email dispatch failed: {str(e)}")
        raise BrevoAPIError(f"SMTP dispatch error: {str(e)}")

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