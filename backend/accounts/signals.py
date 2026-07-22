from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from vendors.models import MenuItem, Order, Rating, SupportTicket

User = get_user_model()

def notify_admins(title, message):
    from accounts.models import Notification
    admins = User.objects.filter(role="admin")
    for admin in admins:
        try:
            Notification.objects.create(
                user=admin,
                title=title,
                message=message,
                is_read=False
            )
        except Exception as e:
            print("Failed to save admin notification in DB:", e)


@receiver(post_save, sender=User)
def user_saved(sender, instance, created, **kwargs):
    if created:
        if instance.role == "vendor":
            notify_admins("New Vendor Registered", f"Vendor kitchen '{instance.full_name or instance.email}' has registered.")
        elif instance.role == "student":
            notify_admins("New Student Registered", f"Student '{instance.full_name or instance.email}' has registered.")
    else:
        # Profile details updated
        notify_admins("Profile Updated", f"User '{instance.full_name or instance.email}' ({instance.role}) updated profile.")


@receiver(post_save, sender=MenuItem)
def menu_item_saved(sender, instance, created, **kwargs):
    try:
        vendor_name = instance.vendor.full_name or instance.vendor.email
        if created:
            notify_admins("Menu Item Added", f"Vendor '{vendor_name}' added a new menu item: '{instance.name}' (Price: ₹{instance.price}).")
        else:
            notify_admins("Menu Item Updated", f"Vendor '{vendor_name}' updated menu item: '{instance.name}'.")
    except Exception as e:
        print("Error in menu_item_saved signal:", e)


@receiver(post_delete, sender=MenuItem)
def menu_item_deleted(sender, instance, **kwargs):
    try:
        vendor_name = instance.vendor.full_name or instance.vendor.email
        notify_admins("Menu Item Deleted", f"Vendor '{vendor_name}' deleted menu item: '{instance.name}'.")
    except Exception as e:
        print("Error in menu_item_deleted signal:", e)


@receiver(post_save, sender=Order)
def order_saved(sender, instance, created, **kwargs):
    try:
        student_name = instance.student.full_name if instance.student else "Offline Walk-up"
        vendor_name = instance.vendor.full_name or instance.vendor.email
        if created:
            notify_admins("New Order Placed", f"Student '{student_name}' placed a new order {instance.order_id} at '{vendor_name}' for ₹{instance.bill}.")
        else:
            if instance.delivery_status == "Delivered":
                notify_admins("Order Completed", f"Order {instance.order_id} from '{vendor_name}' has been delivered to '{student_name}'.")
            elif instance.delivery_status == "Cancelled":
                notify_admins("Order Cancelled", f"Order {instance.order_id} from '{vendor_name}' has been cancelled.")
    except Exception as e:
        print("Error in order_saved signal:", e)


@receiver(post_save, sender=SupportTicket)
def support_ticket_saved(sender, instance, created, **kwargs):
    try:
        if created:
            notify_admins("Support Ticket Created", f"New Support Ticket {instance.ticket_id} ('{instance.title}') created by '{instance.user_name}'.")
    except Exception as e:
        print("Error in support_ticket_saved signal:", e)


@receiver(post_save, sender=Rating)
def rating_saved(sender, instance, created, **kwargs):
    try:
        if created:
            student_name = instance.student.full_name or instance.student.email
            vendor_name = instance.vendor.full_name or instance.vendor.email
            notify_admins("Rating Submitted", f"Student '{student_name}' submitted a {instance.food_rating}★ rating for vendor '{vendor_name}'.")
    except Exception as e:
        print("Error in rating_saved signal:", e)
