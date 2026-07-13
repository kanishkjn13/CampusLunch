from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, SubscriptionViewSet

router = DefaultRouter()
router.register(r"vendors", VendorViewSet, basename="vendor")
router.register(r"subscriptions", SubscriptionViewSet, basename="subscription")

urlpatterns = [
    path("", include(router.urls)),
]

