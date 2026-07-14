from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date
from vendors.models import MenuItem

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
            "is_active",
            "menu_items",
        ]

    def get_description(self, obj):
        return "Delicious campus meals prepared fresh daily by our chefs."

    def get_menu_items(self, obj):
        # Retrieve only active and available menu items for this vendor
        items = MenuItem.objects.filter(vendor=obj, is_available=True, is_active=True)
        return StudentMenuItemSerializer(items, many=True, context=self.context).data

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



