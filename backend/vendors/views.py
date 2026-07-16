from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import MenuItem, Order, OrderTracker, Rating
from .serializers import (
    MenuItemSerializer,
    OrderSerializer,
    OrderTrackerSerializer,
    RatingSerializer,
)
from .permissions import IsVendorOwner

class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsVendorOwner]
    pagination_class = None

    def get_queryset(self):
        return MenuItem.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return Order.objects.filter(student=user)
        elif user.role == "vendor":
            return Order.objects.filter(vendor=user)
        return Order.objects.none()

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_field or "pk"
        lookup_val = self.kwargs[lookup_url_kwarg]
        
        if str(lookup_val).isdigit():
            obj = queryset.filter(id=lookup_val).first()
        else:
            obj = queryset.filter(Q(order_id=lookup_val) | Q(order_id=f"#{lookup_val}")).first()
            
        if not obj:
            from django.http import Http404
            raise Http404("Order not found")
            
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        import random
        count = Order.objects.count()
        new_order_id = f"#TK-{800 + count * 35 + random.randint(0, 24)}"
        
        order = serializer.save(
            student=self.request.user,
            order_id=new_order_id
        )
        
        OrderTracker.objects.create(
            order=order,
            status_index=0,
            progress=0,
            eta="Ready for Pickup",
            location="Tiffin Pickup Point"
        )


class OrderTrackerViewSet(viewsets.ModelViewSet):
    serializer_class = OrderTrackerSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role == "student":
            return OrderTracker.objects.filter(order__student=user)
        elif user.role == "vendor":
            return OrderTracker.objects.filter(order__vendor=user)
        return OrderTracker.objects.none()

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_field or "pk"
        lookup_val = self.kwargs[lookup_url_kwarg]
        
        if str(lookup_val).isdigit():
            obj = queryset.filter(Q(id=lookup_val) | Q(order__id=lookup_val)).first()
        else:
            obj = queryset.filter(Q(order__order_id=lookup_val) | Q(order__order_id=f"#{lookup_val}")).first()
            
        if not obj:
            from django.http import Http404
            raise Http404("Tracker not found")
            
        self.check_object_permissions(self.request, obj)
        return obj


class RatingViewSet(viewsets.ModelViewSet):
    serializer_class = RatingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Rating.objects.all()

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)



