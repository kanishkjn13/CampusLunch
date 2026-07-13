from rest_framework import status
from rest_framework.generics import CreateAPIView,GenericAPIView
from rest_framework.permissions import AllowAny  ,IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .utils import send_password_reset_email

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

        send_password_reset_email(user)

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



 