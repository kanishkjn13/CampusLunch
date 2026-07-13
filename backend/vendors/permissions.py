from rest_framework import permissions

class IsVendorOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a menu item (vendors) to CRUD it.
    Also ensures the user has the 'vendor' role.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'vendor'

    def has_object_permission(self, request, view, obj):
        return obj.vendor == request.user
