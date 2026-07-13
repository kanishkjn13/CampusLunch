from rest_framework import serializers
from django.contrib.auth import get_user_model
from vendors.models import MenuItem
from .models import Subscription
from datetime import date

User = get_user_model()

class StudentMenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "category",
            "meal_type",
            "food_type",
            "price",
            "image",
            "is_available",
        ]

class StudentVendorSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "profile_image",
            "description",
            "is_active",
        ]

    def get_description(self, obj):
        return "Delicious campus meals prepared fresh daily by our chefs."

class StudentVendorDetailSerializer(serializers.ModelSerializer):
    description = serializers.SerializerMethodField()
    menu_items = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "profile_image",
            "description",
            "menu_items",
        ]

    def get_description(self, obj):
        return "Delicious campus meals prepared fresh daily by our chefs."

    def get_menu_items(self, obj):
        # Retrieve only active and available menu items for this vendor
        items = MenuItem.objects.filter(vendor=obj, is_available=True, is_active=True)
        return StudentMenuItemSerializer(items, many=True, context=self.context).data

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone", "profile_image"]

class SubscriptionSerializer(serializers.ModelSerializer):
    student = UserMiniSerializer(read_only=True)
    vendor = UserMiniSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "student",
            "vendor",
            "plan_type",
            "breakfast",
            "lunch",
            "dinner",
            "start_date",
            "end_date",
            "status",
            "created_at",
            "updated_at",
        ]

class CreateSubscriptionSerializer(serializers.ModelSerializer):
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="vendor"),
        source="vendor"
    )

    class Meta:
        model = Subscription
        fields = [
            "vendor_id",
            "plan_type",
            "breakfast",
            "lunch",
            "dinner",
            "start_date",
        ]

    def validate_start_date(self, value):
        if value < date.today():
            raise serializers.ValidationError("Start date cannot be in the past.")
        return value

    def validate(self, data):
        if not (data.get("breakfast") or data.get("lunch") or data.get("dinner")):
            raise serializers.ValidationError("At least one meal type (Breakfast, Lunch, or Dinner) must be selected.")

        student = self.context["request"].user
        vendor = data.get("vendor")

        active_exists = Subscription.objects.filter(
            student=student,
            vendor=vendor,
            status__in=["Active", "Paused"]
        ).exists()

        if active_exists:
            raise serializers.ValidationError("You already have an active or paused subscription with this vendor.")

        return data

