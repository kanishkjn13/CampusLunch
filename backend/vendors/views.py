from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import MenuItem
from .serializers import MenuItemSerializer
from .permissions import IsVendorOwner
from students.models import Subscription
from students.serializers import SubscriptionSerializer

class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsAuthenticated, IsVendorOwner]
    pagination_class = None

    def get_queryset(self):
        return MenuItem.objects.filter(vendor=self.request.user)

    def perform_create(self, serializer):
        serializer.save(vendor=self.request.user)

class VendorSubscriptionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ReadOnly ViewSet for vendors to view active subscribers and history.
    """
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsVendorOwner]

    def get_queryset(self):
        queryset = Subscription.objects.filter(vendor=self.request.user)
        
        # Filter by status
        status_param = self.request.query_params.get("status", None)
        if status_param:
            queryset = queryset.filter(status=status_param)
            
        # Search by student name
        search_param = self.request.query_params.get("search", None)
        if search_param:
            queryset = queryset.filter(student__full_name__icontains=search_param)
            
        return queryset

