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
    category = models.CharField(max_length=100)
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPE_CHOICES)
    food_type = models.CharField(max_length=20, choices=FOOD_TYPE_CHOICES)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    image = models.ImageField(upload_to="menu_items/", blank=True, null=True)
    is_available = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        unique_together = ("vendor", "name")

    def __str__(self):
        return f"{self.name} ({self.vendor.full_name or self.vendor.email})"
