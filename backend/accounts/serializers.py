from django.contrib.auth import get_user_model,authenticate
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode

from rest_framework_simplejwt.tokens import RefreshToken,TokenError

User = get_user_model()
from .models import EmailOTP


class StudentRegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True
    )

    accept_terms = serializers.BooleanField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "full_name",
            "email",
            "phone",
            "password",
            "confirm_password",
            "accept_terms",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True,
                "validators": [validate_password]
            }
        }

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_phone(self, value):

        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "Phone number already exists."
            )

        if len(value) != 10 or not value.isdigit():
            raise serializers.ValidationError(
                "Enter a valid 10 digit phone number."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        if not attrs["accept_terms"]:
            raise serializers.ValidationError(
                {
                    "accept_terms": "Please accept Terms & Conditions."
                }
            )

        # Check if email is verified
        email = attrs.get("email")
        if not EmailOTP.objects.filter(email=email, verified=True).exists():
            raise serializers.ValidationError(
                {
                    "email": "Email address must be verified via OTP first."
                }
            )

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")
        validated_data.pop("accept_terms")

        email = validated_data["email"]

        user = User.objects.create_user(
            full_name=validated_data["full_name"],
            email=email,
            phone=validated_data["phone"],
            password=validated_data["password"],
            role="student"
        )

        # Clean up verified OTP record(s)
        EmailOTP.objects.filter(email=email).delete()

        return user
    
class VendorRegisterSerializer(serializers.ModelSerializer):

    confirm_password = serializers.CharField(
        write_only=True
    )

    accept_terms = serializers.BooleanField(
        write_only=True
    )


    class Meta:
        model = User

        fields = [
            "full_name",
            "email",
            "phone",
            "password",
            "confirm_password",
            "accept_terms",
        ]

        extra_kwargs = {
            "password": {
                "write_only": True,
                "validators": [validate_password]
            }
        }

    def validate_email(self, value):

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_phone(self, value):

        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "Phone already exists."
            )

        if len(value) != 10 or not value.isdigit():
            raise serializers.ValidationError(
                "Enter a valid phone number."
            )

        return value

    def validate(self, attrs):

        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        if not attrs["accept_terms"]:
            raise serializers.ValidationError(
                {
                    "accept_terms": "Please accept Terms & Conditions."
                }
            )

        # Check if email is verified
        email = attrs.get("email")
        if not EmailOTP.objects.filter(email=email, verified=True).exists():
            raise serializers.ValidationError(
                {
                    "email": "Email address must be verified via OTP first."
                }
            )

        return attrs

    def create(self, validated_data):

        validated_data.pop("confirm_password")
        validated_data.pop("accept_terms")

        email = validated_data["email"]

        user = User.objects.create_user(
            full_name=validated_data["full_name"],
            email=email,
            phone=validated_data["phone"],
            password=validated_data["password"],
            role="vendor"
        )

        # Clean up verified OTP record(s)
        EmailOTP.objects.filter(email=email).delete()

        return user



class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "Your account is inactive."
            )

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": user,
        }
      

#changepass serializer
class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(write_only=True)

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )

    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):

        user = self.context["request"].user

        if not user.check_password(attrs["current_password"]):
            raise serializers.ValidationError(
                {
                    "current_password": "Current password is incorrect."
                }
            )

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        if attrs["current_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                {
                    "new_password": "New password must be different from current password."
                }
            )

        return attrs

    def save(self):

        user = self.context["request"].user

        user.set_password(self.validated_data["new_password"])

        user.save()

        return user
    

class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    def validate(self, attrs):
        self.token = attrs["refresh"]
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()

        except TokenError:
            raise serializers.ValidationError(
                {
                    "error": "Invalid or expired refresh token."
                }
            )
        



# email
class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        try:
            user = User.objects.get(email=value)

        except User.DoesNotExist:
            raise serializers.ValidationError(
               {
    "message": "If an account with that email exists, a password reset link has been sent."
}
            )

        self.user = user

        return value

    def save(self):

        return self.user



# reset-pass
class ResetPasswordSerializer(serializers.Serializer):

    uid = serializers.CharField()

    token = serializers.CharField()

    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_password],
    )

    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):

        if attrs["new_password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        try:
            uid = force_str(
                urlsafe_base64_decode(attrs["uid"])
            )

            user = User.objects.get(pk=uid)

        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError(
                {
                    "uid": "Invalid reset link."
                }
            )

        token_generator = PasswordResetTokenGenerator()

        if not token_generator.check_token(
            user,
            attrs["token"],
        ):
            raise serializers.ValidationError(
                {
                    "token": "Invalid or expired token."
                }
            )

        self.user = user

        return attrs

    def save(self):

        self.user.set_password(
            self.validated_data["new_password"]
        )

        self.user.save()

        return self.user


# profile current user
# Current User Serializer
class CurrentUserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "role",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "full_name",
            "email",
            "phone",
            "profile_image",
        ]
        read_only_fields = ["email"]