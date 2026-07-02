from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    StudentRegisterView,
    VendorRegisterView,
    LoginView,
    LogoutView,
    ChangePasswordView,
    ForgotPasswordView,
    ResetPasswordView
)

urlpatterns = [
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

    
]