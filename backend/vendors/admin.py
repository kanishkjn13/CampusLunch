from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import MenuItem


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "vendor",
        "category",
        "meal_type",
        "food_type",
        "price",
        "is_available",
        "is_active",
        "created_at",
    )

    list_filter = (
        "meal_type",
        "food_type",
        "is_available",
        "is_active",
        "category",
        "created_at",
    )

    search_fields = (
        "name",
        "description",
        "category",
        "vendor__email",
        "vendor__full_name",
    )

    ordering = ("-created_at",)
    list_per_page = 20
    readonly_fields = ("created_at", "updated_at")
