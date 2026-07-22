from django.db import models
from django.contrib.auth import get_user_model
from vendors.models import MenuItem

User = get_user_model()

class Cart(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart", limit_choices_to={"role": "student"})
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "students_cart"

    def __str__(self):
        return f"Cart of {self.student.email}"


class CartItem(models.Model):
    id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "students_cartitem"

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} in {self.cart}"


class Subscription(models.Model):
    id = models.AutoField(primary_key=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name="subscriptions", limit_choices_to={"role": "student"})
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="vendor_subscriptions", limit_choices_to={"role": "vendor"})
    plan_type = models.CharField(max_length=20) # 'Weekly' or 'Monthly'
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    includes_breakfast = models.BooleanField(default=False)
    includes_lunch = models.BooleanField(default=False)
    includes_dinner = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "students_subscription"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.plan_type} subscription: {self.student.email} -> {self.vendor.email}"
