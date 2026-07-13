from django.conf import settings
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


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