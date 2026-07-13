import urllib.request
import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

class GoogleAuthView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("credential") or request.data.get("token") or request.data.get("code")
        if not token:
            return Response(
                {"detail": "Google token or credential is required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Try verifying as ID token (credential) first
        user_info = None
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req) as response:
                res_data = json.loads(response.read().decode())
                if "error_description" not in res_data and "email" in res_data:
                    user_info = {
                        "email": res_data.get("email"),
                        "name": res_data.get("name"),
                        "picture": res_data.get("picture")
                    }
        except Exception:
            pass

        # 2. If ID token verification failed, try as access token
        if not user_info:
            try:
                url = f"https://www.googleapis.com/oauth2/v3/userinfo?access_token={token}"
                req = urllib.request.Request(url, method="GET")
                with urllib.request.urlopen(req) as response:
                    res_data = json.loads(response.read().decode())
                    if "email" in res_data:
                        user_info = {
                            "email": res_data.get("email"),
                            "name": res_data.get("name"),
                            "picture": res_data.get("picture")
                        }
            except Exception as e:
                return Response(
                    {"detail": f"Failed to verify Google token: {str(e)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if not user_info or not user_info.get("email"):
            return Response(
                {"detail": "Invalid Google token. Could not retrieve user profile."},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = user_info["email"]
        
        # 3. Find user in the database
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"detail": "This Google account is not registered in Campus Lunch. Please sign up first."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not user.is_active:
            return Response(
                {"detail": "User account is disabled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 4. Generate SimpleJWT tokens
        refresh = RefreshToken.for_user(user)
        
        # Serialize user data using CurrentUserSerializer
        from accounts.serializers import CurrentUserSerializer
        
        return Response(
            {
                "message": "Login successful.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": CurrentUserSerializer(user).data,
            },
            status=status.HTTP_200_OK
        )
