from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import json
import urllib.request
import os

def send_email_http_fallback(to_email, subject, text_body, html_content):
    brevo_api_key = os.getenv("BREVO_API_KEY")
    if brevo_api_key:
        try:
            from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'lunchcampus@gmail.com')
            from_name = "CampusLunch"
            from_addr = "lunchcampus@gmail.com"
            if " <" in from_email:
                from_name, from_addr = from_email.split(" <")
                from_addr = from_addr.replace(">", "").strip()
                from_name = from_name.strip()
            
            url = "https://api.brevo.com/v3/smtp/email"
            headers = {
                "accept": "application/json",
                "content-type": "application/json",
                "api-key": brevo_api_key
            }
            payload = {
                "sender": {"name": from_name, "email": from_addr},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_body
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers=headers,
                method='POST'
            )
            with urllib.request.urlopen(req, timeout=5) as response:
                response.read()
            print(f"[HTTP MAIL] Email sent successfully via Brevo to {to_email}")
            return True
        except Exception as e:
            print(f"[HTTP MAIL ERROR] Failed to send via Brevo HTTP API: {str(e)}")
    return False

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

    if send_email_http_fallback(user.email, subject, "Reset your password.", html_content):
        return

    email = EmailMultiAlternatives(
        subject=subject,
        body="Reset your password.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[user.email],
    )
    email.attach_alternative(
        html_content,
        "text/html",
    )
    email.send()


def send_otp_email(email_address, otp):
    subject = "Verify Your CampusLunch Email"
    context = {
        "otp": otp,
    }
    html_content = render_to_string(
        "emails/otp_verification.html",
        context,
    )

    if send_email_http_fallback(email_address, subject, f"Your CampusLunch verification OTP is {otp}.", html_content):
        return

    email = EmailMultiAlternatives(
        subject=subject,
        body=f"Your CampusLunch verification OTP is {otp}.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email_address],
    )
    email.attach_alternative(
        html_content,
        "text/html",
    )
    email.send()