from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .permissions import IsStudentUser
from .models import Cart, CartItem
from .serializers import (
    StudentVendorSerializer,
    StudentVendorDetailSerializer,
    CartSerializer,
    CartItemSerializer,
)

User = get_user_model()

class VendorViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnly ViewSet for students to browse active vendors.
    """
    permission_classes = [IsAuthenticated, IsStudentUser]

    def get_queryset(self):
        queryset = User.objects.filter(role="vendor")

        # Search by vendor name
        search_query = self.request.query_params.get("search", None)
        if search_query:
            queryset = queryset.filter(full_name__icontains=search_query)

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return StudentVendorDetailSerializer
        return StudentVendorSerializer


class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return Cart.objects.filter(student=self.request.user)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    @action(detail=False, methods=["post"], url_path="add-item")
    def add_item(self, request):
        cart, _ = Cart.objects.get_or_create(student=request.user)
        menu_item_id = request.data.get("menu_item_id") or request.data.get("menu_item")
        quantity = int(request.data.get("quantity", 1))

        if not menu_item_id:
            return Response({"detail": "menu_item_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        from vendors.models import MenuItem
        menu_item = MenuItem.objects.filter(id=menu_item_id).first()
        if not menu_item:
            return Response({"detail": "Menu item not found."}, status=status.HTTP_404_NOT_FOUND)

        item, created = CartItem.objects.get_or_create(cart=cart, menu_item=menu_item)
        if not created:
            item.quantity += quantity
        else:
            item.quantity = quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="clear")
    def clear(self, request):
        cart = Cart.objects.filter(student=request.user).first()
        if cart:
            cart.items.all().delete()
        return Response({"message": "Cart cleared successfully."}, status=status.HTTP_200_OK)


