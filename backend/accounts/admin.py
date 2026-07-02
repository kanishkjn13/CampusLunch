from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):

    list_display = (
        "email",
        "phone",
        "role",
        "is_verified",
        "is_active",
    )

    list_filter = (
        "role",
        "is_verified",
        "is_active",
    )

    search_fields = (
        "name"
        "email",
        "phone",
    )

    ordering = ("-id",)

    list_per_page = 20