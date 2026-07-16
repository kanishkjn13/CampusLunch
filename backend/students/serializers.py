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
            "available_qty",
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
            "is_kitchen_open",
            "menu_items",
        ]

    def get_description(self, obj):
        return "Delicious campus meals prepared fresh daily by our chefs."

    def get_menu_items(self, obj):
        # Retrieve only active and available menu items for this vendor
        items = MenuItem.objects.filter(vendor=obj, is_available=True, is_active=True)
        request = self.context.get('request')
        if request:
            meal_type = request.query_params.get("meal_type")
            if meal_type:
                items = items.filter(meal_type__iexact=meal_type)
            food_type = request.query_params.get("food_type")
            if food_type:
                items = items.filter(food_type__iexact=food_type)
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
            "is_kitchen_open",
            "menu_items",
        ]

    def get_description(self, obj):
        return "Delicious campus meals prepared fresh daily by our chefs."

    def get_menu_items(self, obj):
        # Retrieve only active and available menu items for this vendor
        items = MenuItem.objects.filter(vendor=obj, is_available=True, is_active=True)
        request = self.context.get('request')
        if request:
            meal_type = request.query_params.get("meal_type")
            if meal_type:
                items = items.filter(meal_type__iexact=meal_type)
            food_type = request.query_params.get("food_type")
            if food_type:
                items = items.filter(food_type__iexact=food_type)
        return StudentMenuItemSerializer(items, many=True, context=self.context).data

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "full_name", "email", "phone", "profile_image"]



