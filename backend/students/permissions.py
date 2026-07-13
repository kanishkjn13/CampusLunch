from rest_framework import permissions

class IsStudentUser(permissions.BasePermission):
    """
    Allow access only to authenticated users with the 'student' role.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'
