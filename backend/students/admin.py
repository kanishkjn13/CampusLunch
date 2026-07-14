from django.contrib import admin
from .models import Subscription


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "student",
        "vendor",
        "plan_type",
        "status",
        "start_date",
        "end_date",
        "created_at",
    )

    list_filter = (
        "plan_type",
        "status",
        "breakfast",
        "lunch",
        "dinner",
        "start_date",
        "end_date",
        "created_at",
    )

    search_fields = (
        "student__email",
        "student__full_name",
        "vendor__email",
        "vendor__full_name",
    )

    ordering = ("-created_at",)
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at")
