from rest_framework import serializers
from .models import MenuItem

class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = [
            "id",
            "vendor",
            "name",
            "description",
            "category",
            "meal_type",
            "food_type",
            "price",
            "image",
            "is_available",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "vendor", "created_at", "updated_at"]

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be a positive number greater than zero.")
        return value

    def validate(self, data):
        request = self.context.get("request")
        if request and request.user:
            vendor = request.user
            name = data.get("name")
            
            # Exclude current item for updates
            instance_id = self.instance.id if self.instance else None
            
            if name:
                queryset = MenuItem.objects.filter(vendor=vendor, name__iexact=name)
                if instance_id:
                    queryset = queryset.exclude(id=instance_id)
                if queryset.exists():
                    raise serializers.ValidationError(
                        {"name": "A menu item with this name already exists in your menu."}
                    )
        return data
