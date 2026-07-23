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
            if request.user.role == 'vendor':
                vendor = request.user
                name = data.get("name")
                instance_id = self.instance.id if self.instance else None
                if name:
                    queryset = MenuItem.objects.filter(vendor=vendor, name__iexact=name)
                    if instance_id:
                        queryset = queryset.exclude(id=instance_id)
                    if queryset.exists():
                        raise serializers.ValidationError(
                            {"name": "A menu item with this name already exists in your menu."}
                        )
            elif request.user.role == 'admin':
                # Determine vendor from request data or instance
                vendor = data.get("vendor") or (self.instance.vendor if self.instance else None)
                if not vendor:
                    # Look in raw data if not validated yet (vendor is read-only in serializer, so it's not in validated_data)
                    vendor_id = request.data.get("vendor_id") or request.data.get("vendor")
                    if vendor_id:
                        from django.contrib.auth import get_user_model
                        User = get_user_model()
                        vendor = User.objects.filter(id=vendor_id, role="vendor").first()
                
                name = data.get("name") or (self.instance.name if self.instance else None)
                instance_id = self.instance.id if self.instance else None
                if vendor and name:
                    queryset = MenuItem.objects.filter(vendor=vendor, name__iexact=name)
                    if instance_id:
                        queryset = queryset.exclude(id=instance_id)
                    if queryset.exists():
                        raise serializers.ValidationError(
                            {"name": "A menu item with this name already exists for this vendor."}
                        )
        return data


class OrderTrackerSerializer(serializers.ModelSerializer):
    orderId = serializers.SerializerMethodField()
    vendorName = serializers.SerializerMethodField()
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

    def get_orderId(self, obj):
        try:
            return obj.order.order_id if obj.order else ""
        except Exception:
            return ""

    def get_vendorName(self, obj):
        try:
            if obj.order and obj.order.vendor:
                return obj.order.vendor.full_name or obj.order.vendor.email or "Campus Tiffin Vendor"
        except Exception:
            pass
        return "Campus Tiffin Vendor"

    def get_driver_info(self, obj):
        return {
            "name": obj.driver_name or "Delivery Partner",
            "phone": obj.driver_phone or "N/A",
            "vehicle": obj.vehicle or "Bike",
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
    vendor = serializers.SerializerMethodField()
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

    def get_vendor(self, obj):
        try:
            if obj.vendor:
                return obj.vendor.full_name or obj.vendor.email or "Campus Tiffin Vendor"
        except Exception:
            pass
        return "Campus Tiffin Vendor"

    def get_customer(self, obj):
        try:
            if obj.student:
                return obj.student.full_name or obj.student.email or "Offline Walk-up"
        except Exception:
            pass
        return "Offline Walk-up"

    def get_date(self, obj):
        if obj.created_at:
            return obj.created_at.strftime("%b %d, %Y %I:%M %p")
        return ""


class RatingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    studentName = serializers.SerializerMethodField()
    vendor_name = serializers.SerializerMethodField()
    vendorName = serializers.SerializerMethodField()
    vendor_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role="vendor"),
        source="vendor",
        write_only=True
    )
    vendorId = serializers.SerializerMethodField()
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

    def get_student_name(self, obj):
        try:
            if obj.student:
                return obj.student.full_name or obj.student.email or "Student"
        except Exception:
            pass
        return "Student"

    def get_studentName(self, obj):
        return self.get_student_name(obj)

    def get_vendor_name(self, obj):
        try:
            if obj.vendor:
                return obj.vendor.full_name or obj.vendor.email or "Vendor"
        except Exception:
            pass
        return "Vendor"

    def get_vendorName(self, obj):
        return self.get_vendor_name(obj)

    def get_vendorId(self, obj):
        try:
            if obj.vendor:
                return obj.vendor.id
        except Exception:
            pass
        return None
