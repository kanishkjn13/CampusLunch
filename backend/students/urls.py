from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import VendorViewSet, CartViewSet

router = DefaultRouter()
router.register(r"vendors", VendorViewSet, basename="vendor")
router.register(r"cart", CartViewSet, basename="cart")

urlpatterns = [
    path("", include(router.urls)),
]

