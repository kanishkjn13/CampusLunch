from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import MenuItemViewSet, VendorSubscriptionViewSet

router = DefaultRouter()
router.register(r"menu-items", MenuItemViewSet, basename="menuitem")
router.register(r"subscriptions", VendorSubscriptionViewSet, basename="vendor-subscription")

urlpatterns = [
    path("", include(router.urls)),
]

