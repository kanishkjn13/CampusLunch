from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .permissions import IsStudentUser
from .models import Subscription
from .serializers import (
    StudentVendorSerializer,
    StudentVendorDetailSerializer,
    SubscriptionSerializer,
    CreateSubscriptionSerializer,
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

class SubscriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for students to manage their meal subscriptions.
    """
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        queryset = Subscription.objects.filter(student=self.request.user)
        status_param = self.request.query_params.get("status", None)
        if status_param == "active":
            queryset = queryset.filter(status__in=["Active", "Paused"])
        elif status_param == "history":
            queryset = queryset.filter(status__in=["Cancelled", "Completed"])
        elif status_param:
            queryset = queryset.filter(status=status_param)
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return CreateSubscriptionSerializer
        return SubscriptionSerializer

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=True, methods=["post"])
    def pause(self, request, pk=None):
        subscription = self.get_object()
        if subscription.status != "Active":
            return Response(
                {"detail": "Only active subscriptions can be paused."},
                status=status.HTTP_400_BAD_REQUEST
            )
        subscription.status = "Paused"
        subscription.save()
        return Response(SubscriptionSerializer(subscription).data)

    @action(detail=True, methods=["post"])
    def resume(self, request, pk=None):
        subscription = self.get_object()
        if subscription.status != "Paused":
            return Response(
                {"detail": "Only paused subscriptions can be resumed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        subscription.status = "Active"
        subscription.save()
        return Response(SubscriptionSerializer(subscription).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        subscription = self.get_object()
        if subscription.status not in ["Active", "Paused"]:
            return Response(
                {"detail": "Only active or paused subscriptions can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )
        subscription.status = "Cancelled"
        subscription.save()
        return Response(SubscriptionSerializer(subscription).data)
