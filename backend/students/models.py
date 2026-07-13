from django.db import models
from django.contrib.auth import get_user_model
from datetime import date, timedelta

User = get_user_model()

class Subscription(models.Model):
    PLAN_CHOICES = (
        ("Weekly", "Weekly"),
        ("Monthly", "Monthly"),
    )
    
    STATUS_CHOICES = (
        ("Active", "Active"),
        ("Paused", "Paused"),
        ("Cancelled", "Cancelled"),
        ("Completed", "Completed"),
    )

    student = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="subscriptions",
        limit_choices_to={"role": "student"}
    )
    vendor = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="vendor_subscriptions",
        limit_choices_to={"role": "vendor"}
    )
    plan_type = models.CharField(max_length=20, choices=PLAN_CHOICES)
    
    # Meal types
    breakfast = models.BooleanField(default=False)
    lunch = models.BooleanField(default=False)
    dinner = models.BooleanField(default=False)
    
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["student", "vendor"],
                condition=models.Q(status__in=["Active", "Paused"]),
                name="unique_active_student_vendor_subscription"
            )
        ]

    def save(self, *args, **kwargs):
        if not self.end_date:
            if self.plan_type == "Weekly":
                self.end_date = self.start_date + timedelta(days=7)
            elif self.plan_type == "Monthly":
                self.end_date = self.start_date + timedelta(days=30)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.student.full_name or self.student.email} -> {self.vendor.full_name or self.vendor.email} ({self.plan_type})"

