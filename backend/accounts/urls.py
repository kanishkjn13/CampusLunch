from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views_oauth import GoogleAuthView
from .views import (
    StudentRegisterView,
    VendorRegisterView,
    LoginView,
    LogoutView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView,
    CurrentUserView,
    ProfileView,
    AdminVendorListView,
    AdminVerifyVendorView,
    AdminOnboardVendorView,
    SystemHealthView,
    AdminSupportTicketListView,
    AdminSupportMessageView,
    AdminSupportTicketStatusView,
    AdminDashboardStatsView,
    AdminStudentListView,
    AdminManageStudentView,
    NotificationListView,
    NotificationMarkReadView,
    NotificationMarkReadAllView,
    AdminBroadcastView,
)

urlpatterns = [
    path(
        "google/",
        GoogleAuthView.as_view(),
        name="google-login",
    ),
    path(
        "register/student/",
        StudentRegisterView.as_view(),
        name="student-register",
    ),

    path(
        "register/vendor/",
        VendorRegisterView.as_view(),
        name="vendor-register",
    ),
    
    path("login/",
         LoginView.as_view(),
         name="login",
    ),
    path("logout/",
         LogoutView.as_view(),
         name="logout")
    , path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token-refresh",
    ),
    path(
    "change-password/",
    ChangePasswordView.as_view(),
    name="change-password",
    ),
    path(
    "forgot-password/",
    ForgotPasswordView.as_view(),
    name="forgot-password",
    ),
    path(
    "reset-password/",
    ResetPasswordView.as_view(),
    name="reset-password",
    ),
    path(
    "current-profile/",
    CurrentUserView.as_view(),
    name="current-user",
    ),
    path("profile/", ProfileView.as_view()),
    path("admin/vendors/", AdminVendorListView.as_view(), name="admin-vendor-list"),
    path("admin/vendors/onboard/", AdminOnboardVendorView.as_view(), name="admin-onboard-vendor"),
    path("admin/vendors/<str:vendor_id>/verify/", AdminVerifyVendorView.as_view(), name="admin-verify-vendor"),
    path("system-health/", SystemHealthView.as_view(), name="system-health"),
    path("admin/support/tickets/", AdminSupportTicketListView.as_view(), name="admin-support-tickets"),
    path("admin/support/tickets/<str:ticket_id>/messages/", AdminSupportMessageView.as_view(), name="admin-support-messages"),
    path("admin/support/tickets/<str:ticket_id>/status/", AdminSupportTicketStatusView.as_view(), name="admin-support-status"),
    path("admin/stats/", AdminDashboardStatsView.as_view(), name="admin-stats"),
    path("admin/students/", AdminStudentListView.as_view(), name="admin-student-list"),
    path("admin/students/<str:student_id>/manage/", AdminManageStudentView.as_view(), name="admin-manage-student"),
    path("notifications/", NotificationListView.as_view(), name="notifications"),
    path("notifications/<int:notification_id>/read/", NotificationMarkReadView.as_view(), name="notification-mark-read"),
    path("notifications/read-all/", NotificationMarkReadAllView.as_view(), name="notification-mark-read-all"),
    path("admin/broadcast/", AdminBroadcastView.as_view(), name="admin-broadcast"),
]