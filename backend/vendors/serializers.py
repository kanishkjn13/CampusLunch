from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import MenuItem, Order, OrderTracker, Rating

User = get_user_model()

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
            "available_qty",
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


class OrderTrackerSerializer(serializers.ModelSerializer):
    orderId = serializers.CharField(source="order.order_id", read_only=True)
    vendorName = serializers.CharField(source="order.vendor.full_name", read_only=True)
    statusIndex = serializers.IntegerField(source="status_index")
    driverInfo = serializers.SerializerMethodField(method_name="get_driver_info")

    class Meta:
        model = OrderTracker
        fields = [
            "id",
            "orderId",
            "vendorName",
            "statusIndex",
            "progress",
            "eta",
            "location",
            "driverInfo",
        ]

    def get_driver_info(self, obj):
        return {
            "name": obj.driver_name,
            "phone": obj.driver_phone,
            "vehicle": obj.vehicle,
            "photo": "/images/default-avatar.jpg",
        }


class OrderSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source="order_id", read_only=True)
    tracker = OrderTrackerSerializer(read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="vendor"),
        source="vendor",
        write_only=True
    )
    paymentMethod = serializers.CharField(source="payment_method")
    paymentStatus = serializers.CharField(source="payment_status", required=False)
    deliveryStatus = serializers.CharField(source="delivery_status", required=False)
    items = serializers.CharField(source="items_json")
    vendor = serializers.CharField(source="vendor.full_name", read_only=True)
    customer = serializers.SerializerMethodField()
    date = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_id",
            "vendor_id",
            "vendor",
            "customer",
            "items",
            "bill",
            "paymentMethod",
            "paymentStatus",
            "deliveryStatus",
            "tracker",
            "date",
        ]
        read_only_fields = ["id", "order_id", "date"]

    def get_customer(self, obj):
        return obj.student.full_name if obj.student else "Offline Walk-up"

    def get_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y %I:%M %p")


class RatingSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    studentName = serializers.CharField(source="student.full_name", read_only=True)
    vendor_name = serializers.CharField(source="vendor.full_name", read_only=True)
    vendorName = serializers.CharField(source="vendor.full_name", read_only=True)
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="vendor"),
        source="vendor",
        write_only=True
    )
    vendorId = serializers.IntegerField(source="vendor.id", read_only=True)
    orderId = serializers.CharField(source="order_id", required=False, allow_blank=True, allow_null=True)
    foodRating = serializers.IntegerField(source="food_rating")
    serviceRating = serializers.IntegerField(source="service_rating")

    class Meta:
        model = Rating
        fields = [
            "id",
            "orderId",
            "vendor_id",
            "vendorId",
            "vendor_name",
            "vendorName",
            "student_name",
            "studentName",
            "foodRating",
            "serviceRating",
            "comment",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
