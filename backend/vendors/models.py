import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class MenuItem(models.Model):
    MEAL_TYPE_CHOICES = (
        ("Breakfast", "Breakfast"),
        ("Lunch", "Lunch"),
        ("Dinner", "Dinner"),
    )
    
    FOOD_TYPE_CHOICES = (
        ("Veg", "Veg"),
        ("Non-Veg", "Non-Veg"),
    )

    id = models.AutoField(
        primary_key=True,
        editable=False
    )
    vendor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="menu_items",
        limit_choices_to={"role": "vendor"}
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=100, default="Main", blank=True, null=True)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES, default="Lunch", blank=True, null=True)
    food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES, default="Veg", blank=True, null=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="menu_items/", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    available_qty = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("vendor", "name")

    def __str__(self):
        return f"{self.name} ({self.vendor.full_name or self.vendor.email})"


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    order_id = models.CharField(max_length=50, unique=True)
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders", limit_choices_to={"role": "student"})
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vendor_orders", limit_choices_to={"role": "vendor"})
    items_json = models.TextField()
    bill = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)
    payment_status = models.CharField(max_length=50, default="Paid")
    delivery_status = models.CharField(max_length=50, default="Confirmed")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        student_email = self.student.email if self.student else "Offline Walk-up"
        return f"{self.order_id} - {student_email} -> {self.vendor.email}"


class OrderTracker(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name="tracker")
    status_index = models.IntegerField(default=0)
    progress = models.IntegerField(default=0)
    eta = models.CharField(max_length=100, default="Ready for Pickup")
    location = models.CharField(max_length=200, default="Tiffin Pickup Point")
    driver_name = models.CharField(max_length=100, default="Tiffin Vendor")
    driver_phone = models.CharField(max_length=20, default="+91 98765 43210")
    vehicle = models.CharField(max_length=50, default="Pickup Counter")
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Tracker for {self.order.order_id}"


class Rating(models.Model):
    id = models.AutoField(primary_key=True)
    order_id = models.CharField(max_length=50, blank=True, null=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="student_ratings", limit_choices_to={"role": "student"})
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vendor_ratings", limit_choices_to={"role": "vendor"})
    food_rating = models.IntegerField()
    service_rating = models.IntegerField()
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating for {self.vendor.email} by {self.student.email}"


class SupportTicket(models.Model):
    USER_TYPE_CHOICES = (
        ("customer", "Customer"),
        ("vendor", "Vendor"),
    )
    STATUS_CHOICES = (
        ("open", "Open"),
        ("in_progress", "In Progress"),
        ("closed", "Closed"),
    )

    id = models.AutoField(primary_key=True)
    ticket_id = models.CharField(max_length=50, unique=True)
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default="customer")
    user_name = models.CharField(max_length=150)
    user_email = models.EmailField(blank=True, null=True)
    user_phone = models.CharField(max_length=50, blank=True, null=True)
    order_id = models.CharField(max_length=100, blank=True, null=True)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="open")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.ticket_id} - {self.title} ({self.status})"


class SupportMessage(models.Model):
    id = models.AutoField(primary_key=True)
    ticket = models.ForeignKey(SupportTicket, on_delete=models.CASCADE, related_name="messages")
    sender = models.CharField(max_length=50, default="admin") # 'admin' or 'user'
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Msg #{self.id} for {self.ticket.ticket_id}"
