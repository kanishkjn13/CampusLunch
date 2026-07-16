import uuid

from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):

    ROLE_CHOICES = (
        ("student", "Student"),
        ("vendor", "Vendor"),
        ("admin", "Admin"),
    )

    id = models.AutoField(
        primary_key=True,
        editable=False
    )
    full_name = models.CharField(
    max_length=100,
    blank=True,
    null=True
)

    email = models.EmailField(
        unique=True
    )

    phone = models.CharField(
        max_length=10,
        unique=True
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES
    )

    is_active = models.BooleanField(
        default=True
    )

    is_kitchen_open = models.BooleanField(
        default=True
    )

    is_staff = models.BooleanField(
        default=False
    )

    is_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    profile_image = models.ImageField(
        upload_to="profile_images/",
        blank=True,
        null=True
    )

    avatar = models.TextField(
        blank=True,
        null=True
    )

    sync_orders_trigger = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    sync_trackers_trigger = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    sync_ratings_trigger = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    tiffin_connect_sellers = models.TextField(
        blank=True,
        null=True
    )

    last_stock_reset = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    vendor_working_days = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    vendor_timings = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    vendor_auto_accept = models.CharField(
        max_length=20,
        blank=True,
        null=True
    )

    objects = UserManager()

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = [
        "full_name",
        "phone",
        "role"
    ]

    def __str__(self):
        return self.email


class EmailOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.email} - {self.otp} - Verified: {self.verified}"
