from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .permissions import IsStudentUser
from .serializers import (
    StudentVendorSerializer,
    StudentVendorDetailSerializer,
)

User = get_user_model()

class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnly ViewSet for students to browse active vendors.
    """
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        queryset = User.objects.filter(role="vendor", is_active=True)

        # Search by vendor name
        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(full_name__icontains=search_query)

        # Filter by Meal Type
        meal_type = self.request.query_params.get("meal_type", None)
        if meal_type:
            queryset = queryset.filter(
                menu_items__meal_type__iexact=meal_type,
                menu_items__is_available=True,
                menu_items__is_active=True
            ).distinct()

        # Filter Veg / Non-Veg
        food_type = self.request.query_params.get("food_type", None)
        if food_type:
            queryset = queryset.filter(
                menu_items__food_type__iexact=food_type,
                menu_items__is_available=True,
                menu_items__is_active=True
            ).distinct()

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StudentVendorDetailSerializer
        return StudentVendorSerializer


