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


