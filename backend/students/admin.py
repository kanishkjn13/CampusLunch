from django.contrib import admin
from accounts.models import EmailOTP


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "otp", "expires_at", "verified", "created_at")
    list_filter = ("verified",)
    search_fields = ("email",)
    ordering = ("-created_at",)
