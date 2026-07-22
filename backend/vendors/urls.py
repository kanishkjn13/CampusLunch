from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    MenuItemViewSet,
    OrderViewSet,
    OrderTrackerViewSet,
    RatingViewSet,
    AdminMenuItemViewSet,
)

router = DefaultRouter()
router.register(r"menu-items", MenuItemViewSet, basename="menuitem")
router.register(r"admin/menu-items", AdminMenuItemViewSet, basename="admin-menuitem")
router.register(r"orders", OrderViewSet, basename="order")
router.register(r"trackers", OrderTrackerViewSet, basename="tracker")
router.register(r"ratings", RatingViewSet, basename="rating")

urlpatterns = [
    path("", include(router.urls)),
]

