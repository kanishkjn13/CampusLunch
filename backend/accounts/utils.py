from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import requests
import os

def send_brevo_api_email(to_email, subject, html_content, text_content=""):
    api_key = getattr(settings, 'BREVO_API_KEY', '')
    if not api_key:
        api_key = os.getenv('BREVO_API_KEY', '')

    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'lunchcampus@gmail.com')
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

    response = requests.post(url, json=payload, headers=headers, timeout=5)
    response.raise_for_status()
    print(f"[HTTP MAIL] Email sent successfully via Brevo API to {to_email}")
    return response.json()

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