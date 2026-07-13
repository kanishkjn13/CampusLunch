import random
from datetime import timedelta
from django.utils import timezone
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.generics import CreateAPIView,GenericAPIView
from rest_framework.permissions import AllowAny  ,IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import EmailOTP
from .utils import send_otp_email, send_password_reset_email

from .serializers import (
    StudentRegisterSerializer,
    VendorRegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    CurrentUserSerializer,
    ProfileSerializer

)  



class StudentRegisterView(CreateAPIView):

    serializer_class = StudentRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Student registered successfully.",
                "user": {
                    "id": str(user.id),
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class VendorRegisterView(CreateAPIView):

    serializer_class = VendorRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "Vendor registered successfully.",
                "user": {
                    "id": str(user.id),
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone": user.phone,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED,
        )
    


class LoginView(CreateAPIView):

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        user = data["user"]

        return Response(
            {
                "message": "Login successful.",
                "access": data["access"],
                "refresh": data["refresh"],
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )
    


class LogoutView(GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {"message": "Logout successful."},
            status=status.HTTP_200_OK,
        )
    

class ChangePasswordView(GenericAPIView):

    serializer_class = ChangePasswordSerializer

    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message": "Password changed successfully."
            },
            status=status.HTTP_200_OK,
        )




class ForgotPasswordView(GenericAPIView):

    serializer_class = ForgotPasswordSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        try:
            send_password_reset_email(user)
        except Exception as e:
            # Generate the link again to log it
            from django.utils.http import urlsafe_base64_encode
            from django.utils.encoding import force_bytes
            from django.contrib.auth.tokens import PasswordResetTokenGenerator
            from django.conf import settings
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = PasswordResetTokenGenerator().make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}"
            print(f"\n[SANDBOX FALLBACK] Failed to send password reset email via SMTP: {str(e)}")
            print(f"Password reset link for {user.email} is: {reset_link}\n")
            return Response(
                {"message": "Password reset link generated. (Sandbox Mode: Retrieve link from server logs)"},
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "message": "Password reset link sent successfully."
            },
            status=status.HTTP_200_OK,
        )  



#  reset-pass
class ResetPasswordView(GenericAPIView):

    serializer_class = ResetPasswordSerializer

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        serializer.save()

        return Response(
            {
                "message": "Password reset successful."
            },
            status=status.HTTP_200_OK,
        )



class CurrentUserView(GenericAPIView):

    serializer_class = CurrentUserSerializer

    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):

        serializer = self.get_serializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )
    

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


User = get_user_model()


class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check if email is already registered/verified in User table
        if User.objects.filter(email=email).exists():
            return Response({"detail": "Email already verified / registered."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()

        # Cooldown check: 30-second cooldown
        last_otp = EmailOTP.objects.filter(email=email).order_by("-created_at").first()
        if last_otp and (now - last_otp.created_at) < timedelta(seconds=30):
            cooldown_left = 30 - int((now - last_otp.created_at).total_seconds())
            return Response(
                {"detail": f"Please wait {cooldown_left} seconds before requesting a new OTP."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Rate limit check: Maximum 3 requests in 10 minutes
        ten_mins_ago = now - timedelta(minutes=10)
        recent_requests_count = EmailOTP.objects.filter(email=email, created_at__gte=ten_mins_ago).count()
        if recent_requests_count >= 3:
            return Response(
                {"detail": "Too many requests. You can only request up to 3 OTPs in 10 minutes."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Generate OTP
        otp = f"{random.randint(100000, 999999)}"

        # Send Email
        try:
            send_otp_email(email, otp)
        except Exception as e:
            print(f"\n[SANDBOX FALLBACK] Failed to send email via SMTP: {str(e)}")
            print(f"Generated OTP for {email} is: {otp}\n")
            # Proceed successfully in case SMTP fails/timeouts so the user can sign up using logs OTP
            EmailOTP.objects.create(email=email, otp=otp)
            return Response(
                {"message": "OTP generated. (Sandbox Mode: Retrieve your OTP from the server logs)"},
                status=status.HTTP_200_OK
            )

        # Save to database
        EmailOTP.objects.create(email=email, otp=otp)

        return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)


class ResendOTPView(SendOTPView):
    pass


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"detail": "Email and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Find latest unverified OTP for this email
        otp_record = EmailOTP.objects.filter(email=email, verified=False).order_by("-created_at").first()

        if not otp_record or otp_record.otp != otp:
            return Response({"detail": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Check expiration (5 minutes)
        if (timezone.now() - otp_record.created_at) > timedelta(minutes=5):
            return Response({"detail": "Expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        # Mark verified and invalidate/clear OTP code
        otp_record.verified = True
        otp_record.otp = ""
        otp_record.save()

        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)



 