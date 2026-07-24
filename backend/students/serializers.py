from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date
from vendors.models import MenuItem
from .models import Cart, CartItem

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


class CartItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.SerializerMethodField()
    menu_item_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ["id", "menu_item", "menu_item_name", "menu_item_price", "quantity", "created_at"]

    def get_menu_item_name(self, obj):
        try:
            return obj.menu_item.name if obj.menu_item else "Menu Item"
        except Exception:
            return "Menu Item"

    def get_menu_item_price(self, obj):
        try:
            return float(obj.menu_item.price) if obj.menu_item else 0.0
        except Exception:
            return 0.0


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    student_email = serializers.CharField(source="student.email", read_only=True)

    class Meta:
        model = Cart
        fields = ["id", "student", "student_email", "items", "created_at", "updated_at"]
        read_only_fields = ["id", "student", "created_at", "updated_at"]



