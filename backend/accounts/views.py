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
from .utils import send_otp_email, send_password_reset_email, InvalidApiKeyError, BrevoAPIError

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
            print(f"\n[SANDBOX FALLBACK] Failed to send password reset email via Brevo API: {str(e)}")
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

    def delete(self, request):
        user = request.user
        user.delete()
        return Response({"message": "Account deleted successfully."}, status=status.HTTP_204_NO_CONTENT)


User = get_user_model()

class SendOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"detail": "Email already verified / registered."}, status=status.HTTP_400_BAD_REQUEST)

        now = timezone.now()

        # Cooldown check
        last_otp = EmailOTP.objects.filter(email=email).order_by("-created_at").first()
        if last_otp and (now - last_otp.created_at) < timedelta(seconds=30):
            cooldown_left = 30 - int((now - last_otp.created_at).total_seconds())
            return Response(
                {"detail": f"Please wait {cooldown_left} seconds before requesting a new OTP."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Rate limit check
        ten_mins_ago = now - timedelta(minutes=10)
        recent_requests_count = EmailOTP.objects.filter(email=email, created_at__gte=ten_mins_ago).count()
        if recent_requests_count >= 3:
            return Response(
                {"detail": "Too many requests. You can only request up to 3 OTPs in 10 minutes."},
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Delete old unverified records
        EmailOTP.objects.filter(email=email, verified=False).delete()

        otp = f"{random.randint(100000, 999999)}"
        expires_at = now + timedelta(minutes=5)

        try:
            send_otp_email(email, otp)
        except InvalidApiKeyError as e:
            return Response(
                {"detail": f"Invalid/missing Brevo API key or unauthorized IP address: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {"detail": f"Failed to send verification email: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        EmailOTP.objects.create(email=email, otp=otp, expires_at=expires_at)
        from django.core.cache import cache
        cache.delete(f"otp_attempts_{email}")

        return Response({"message": "OTP sent successfully."}, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        otp = request.data.get("otp")

        if not email or not otp:
            return Response({"detail": "Email and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        from django.core.cache import cache
        cache_key = f"otp_attempts_{email}"
        attempts = cache.get(cache_key, 0)

        otp_record = EmailOTP.objects.filter(email=email, verified=False).order_by("-created_at").first()
        if not otp_record:
            return Response({"detail": "No OTP found for this email. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if attempts >= 3:
            otp_record.delete()
            cache.delete(cache_key)
            return Response({"detail": "Too many failed attempts. This OTP has been invalidated. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if timezone.now() > otp_record.expires_at:
            return Response({"detail": "Expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp != otp:
            cache.set(cache_key, attempts + 1, timeout=300)
            return Response({"detail": f"Invalid OTP. {3 - (attempts + 1)} attempts remaining."}, status=status.HTTP_400_BAD_REQUEST)

        otp_record.verified = True
        otp_record.otp = ""
        otp_record.save()

        cache.delete(cache_key)

        return Response({"message": "OTP verified successfully."}, status=status.HTTP_200_OK)


class AdminVendorListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from django.db.models import Sum, Avg
        from vendors.models import Order, Rating, MenuItem
        vendors = User.objects.filter(role="vendor").order_by("-created_at")
        data = []
        for v in vendors:
            orders_qs = Order.objects.filter(vendor=v)
            total_sales = float(orders_qs.filter(delivery_status="Delivered").aggregate(total=Sum("bill"))["total"] or 0)
            total_orders = orders_qs.count()
            total_customers = orders_qs.values("student").distinct().count()
            
            avg_food = Rating.objects.filter(vendor=v).aggregate(avg=Avg("food_rating"))["avg"] or 0
            avg_service = Rating.objects.filter(vendor=v).aggregate(avg=Avg("service_rating"))["avg"] or 0
            avg_rating = round((float(avg_food) + float(avg_service)) / 2, 1) if Rating.objects.filter(vendor=v).exists() else 0.0
            
            data.append({
                "id": f"V-{1000 + v.id}",
                "real_id": v.id,
                "name": v.full_name or v.email.split("@")[0],
                "email": v.email,
                "phone": v.phone,
                "type": "Vendor Kitchen Partner",
                "detail": f"Phone: {v.phone} • {v.email}",
                "colorClass": "accent-gold",
                "bgClass": "bg-peach",
                "icon": "store",
                "is_verified": v.is_verified,
                "is_active": v.is_active,
                "status": "Verified" if v.is_verified else "Pending",
                "created_at": v.created_at.strftime("%Y-%m-%d %H:%M"),
                "last_login": v.last_login.strftime("%Y-%m-%d %H:%M") if v.last_login else "Never",
                "total_sales": total_sales,
                "total_orders": total_orders,
                "total_customers": total_customers,
                "average_rating": avg_rating,
                "menu_count": MenuItem.objects.filter(vendor=v).count(),
                "timings": v.vendor_timings or "09:00 AM - 09:00 PM",
                "working_days": v.vendor_working_days or "Mon-Sat",
                "auto_accept": v.vendor_auto_accept or "Enabled"
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminVerifyVendorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, vendor_id):
        try:
            vendor = None
            if str(vendor_id).startswith("V-"):
                try:
                    v_id = int(str(vendor_id).replace("V-", "")) - 1000
                    vendor = User.objects.filter(id=v_id, role="vendor").first()
                except Exception:
                    pass
            if not vendor:
                vendor = User.objects.filter(id=vendor_id, role="vendor").first()
            if not vendor:
                vendor = User.objects.filter(email__iexact=str(vendor_id), role="vendor").first()

            if not vendor:
                return Response({"detail": "Vendor not found."}, status=status.HTTP_404_NOT_FOUND)

            action = request.data.get("action", "approve")
            if action == "approve":
                vendor.is_verified = True
                vendor.save()
                return Response({
                    "message": f"Vendor '{vendor.full_name or vendor.email}' verified successfully.",
                    "is_verified": True,
                    "status": "Verified"
                }, status=status.HTTP_200_OK)
            elif action == "reject":
                vendor.is_verified = False
                vendor.save()
                return Response({
                    "message": f"Vendor '{vendor.full_name or vendor.email}' verification rejected.",
                    "is_verified": False,
                    "status": "Rejected"
                }, status=status.HTTP_200_OK)
            elif action == "suspend":
                vendor.is_active = False
                vendor.save()
                return Response({
                    "message": f"Vendor '{vendor.full_name or vendor.email}' suspended successfully.",
                    "is_active": False,
                    "status": "Suspended"
                }, status=status.HTTP_200_OK)
            elif action == "restore":
                vendor.is_active = True
                vendor.save()
                return Response({
                    "message": f"Vendor '{vendor.full_name or vendor.email}' restored successfully.",
                    "is_active": True,
                    "status": "Verified"
                }, status=status.HTTP_200_OK)

            return Response({"detail": "Invalid action specified."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AdminOnboardVendorView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        full_name = request.data.get("full_name") or request.data.get("name")
        phone = request.data.get("phone") or request.data.get("phone_number") or ""
        password = request.data.get("password") or "Vendor123!"

        if not email or not full_name:
            return Response({"detail": "Email and Kitchen Name are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email__iexact=email).exists():
            return Response({"detail": "A user with this email address already exists."}, status=status.HTTP_400_BAD_REQUEST)

        vendor = User.objects.create_user(
            email=email,
            password=password,
            full_name=full_name,
            phone=phone,
            role="vendor",
            is_verified=True,
            is_email_verified=True
        )
        return Response({
            "detail": f"Successfully onboarded vendor kitchen '{full_name}'.",
            "id": f"V-{1000 + vendor.id}",
            "real_id": vendor.id,
            "name": vendor.full_name,
            "email": vendor.email,
            "phone": vendor.phone,
            "is_verified": True,
            "status": "Verified"
        }, status=status.HTTP_201_CREATED)


class SystemHealthView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        import os
        import time
        import requests
        from django.db import connection
        from django.core.cache import cache
        from django.conf import settings

        # 1. Django API & Database Check
        t0 = time.time()
        db_ok = True
        db_msg = "Database Synced"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception as e:
            db_ok = False
            db_msg = f"DB Error: {str(e)}"
        latency_ms = round((time.time() - t0) * 1000, 1)

        # 2. Brevo Email API Status
        brevo_key = getattr(settings, 'BREVO_API_KEY', None) or os.getenv('BREVO_API_KEY', '')
        brevo_ok = False
        if brevo_key:
            try:
                res = requests.get(
                    "https://api.brevo.com/v3/account",
                    headers={"api-key": brevo_key, "accept": "application/json"},
                    timeout=3
                )
                if res.status_code == 200:
                    brevo_ok = True
                    data = res.json()
                    brevo_msg = f"Connected ({data.get('email', 'Active API')})"
                else:
                    brevo_msg = f"HTTP {res.status_code}"
            except Exception as e:
                brevo_msg = f"Unreachable ({str(e)[:30]})"
        else:
            brevo_msg = "Console SMTP Fallback Active (API Key Not Set)"

        # 3. Dynamic Commission Rate
        commission_rate = cache.get("platform_commission_rate", 12.0)

        return Response({
            "backend": {
                "status": "Online" if db_ok else "Offline",
                "is_active": db_ok,
                "latency_ms": latency_ms,
                "message": db_msg
            },
            "brevo": {
                "status": "Active" if brevo_ok else ("Fallback Active" if brevo_msg.startswith("Console") else "Offline"),
                "is_active": brevo_ok or brevo_msg.startswith("Console"),
                "message": brevo_msg
            },
            "commission_rate": commission_rate
        }, status=status.HTTP_200_OK)

    def post(self, request):
        from django.core.cache import cache
        rate = request.data.get("commission_rate")
        if rate is not None:
            try:
                rate_val = float(rate)
                cache.set("platform_commission_rate", rate_val, timeout=None)
                return Response({
                    "message": f"Commission rate updated to {rate_val}%.",
                    "commission_rate": rate_val
                }, status=status.HTTP_200_OK)
            except ValueError:
                return Response({"detail": "Invalid rate numeric value."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"detail": "commission_rate field required."}, status=status.HTTP_400_BAD_REQUEST)


class AdminSupportTicketListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from vendors.models import SupportTicket, SupportMessage
        
        # Auto-seed default tickets if empty
        if not SupportTicket.objects.exists():
            seed_data = [
                {
                    "ticket_id": "TK-8821",
                    "user_type": "customer",
                    "title": "Order Delayed - Food not arrived yet",
                    "user_name": "Kanishk Jain (Student)",
                    "user_email": "kanishkjn13@gmail.com",
                    "user_phone": "+91 98765 43210",
                    "order_id": "#ORD-99212",
                    "status": "open",
                    "messages": [
                        {"sender": "admin", "text": "Hi there! Welcome to Campus Lunch Live Support. 👋 How can we help you today?"},
                        {"sender": "user", "text": "Hi, my order #ORD-99212 was supposed to be delivered at 12:30 PM, but it hasn't arrived yet."}
                    ]
                },
                {
                    "ticket_id": "TK-8819",
                    "user_type": "customer",
                    "title": "Missing Item in Tiffin Box",
                    "user_name": "Ashu Mukati (Student)",
                    "user_email": "mukatiashwin217@gmail.com",
                    "user_phone": "+91 87654 32109",
                    "order_id": "#ORD-99208",
                    "status": "open",
                    "messages": [
                        {"sender": "admin", "text": "Hello Ashu! Welcome to Campus Lunch Live Support. 👋 How can we help you today?"},
                        {"sender": "user", "text": "I ordered the Special Thali, but the gulab jamun sweet was missing."}
                    ]
                },
                {
                    "ticket_id": "TK-8815",
                    "user_type": "vendor",
                    "title": "Kitchen Weekly Payout Settlement",
                    "user_name": "vendor1 (Vendor)",
                    "user_email": "vendor123@gmail.com",
                    "user_phone": "+91 76543 21098",
                    "order_id": "N/A (Payout Inquiry)",
                    "status": "open",
                    "messages": [
                        {"sender": "admin", "text": "Hello Vendor! Welcome to Campus Lunch Kitchen Support. How can we assist you with your orders or payouts today?"},
                        {"sender": "user", "text": "Could you please confirm when the weekly payout for order cycle #998 will be processed?"}
                    ]
                },
                {
                    "ticket_id": "TK-8802",
                    "user_type": "vendor",
                    "title": "Kitchen Stock Update Query",
                    "user_name": "Sharma Tiffin Center",
                    "user_email": "sharma@example.com",
                    "user_phone": "+91 65432 10987",
                    "order_id": "N/A (Dashboard)",
                    "status": "open",
                    "messages": [
                        {"sender": "admin", "text": "Hello Sharma Tiffin Center! Welcome to Campus Lunch Support. How can we assist you today?"},
                        {"sender": "user", "text": "How do I update the available quantity for my dinner tiffins?"}
                    ]
                }
            ]

            for s in seed_data:
                msgs = s.pop("messages")
                t = SupportTicket.objects.create(**s)
                for m in msgs:
                    SupportMessage.objects.create(ticket=t, sender=m["sender"], text=m["text"])

        tickets = SupportTicket.objects.all().order_by("created_at")
        res = []
        for t in tickets:
            res.append({
                "id": t.ticket_id,
                "ticket_id": t.ticket_id,
                "userType": t.user_type,
                "userName": t.user_name,
                "userEmail": t.user_email or "",
                "userPhone": t.user_phone or "",
                "orderId": t.order_id or "N/A",
                "title": t.title,
                "status": t.status,
                "created": t.created_at.strftime("%b %d, %I:%M %p")
            })
        return Response(res, status=status.HTTP_200_OK)

    def post(self, request):
        from vendors.models import SupportTicket, SupportMessage
        user_type = request.data.get("userType", "customer")
        title = request.data.get("title") or "General Support Inquiry"
        user_name = request.data.get("userName") or "Campus User"
        user_email = request.data.get("userEmail", "")
        order_id = request.data.get("orderId", "N/A")
        initial_message = request.data.get("message") or title

        import random
        t_id = f"TK-{random.randint(8800, 9999)}"
        ticket = SupportTicket.objects.create(
            ticket_id=t_id,
            user_type=user_type,
            user_name=user_name,
            user_email=user_email,
            order_id=order_id,
            title=title,
            status="open"
        )
        SupportMessage.objects.create(
            ticket=ticket,
            sender="admin",
            text=f"Hi {user_name}! Welcome to Campus Lunch Live Support. 👋 How can we help you today?"
        )
        SupportMessage.objects.create(
            ticket=ticket,
            sender="user",
            text=initial_message
        )
        return Response({
            "message": "Ticket created successfully.",
            "id": ticket.ticket_id,
            "ticket_id": ticket.ticket_id
        }, status=status.HTTP_201_CREATED)


class AdminSupportMessageView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, ticket_id):
        from vendors.models import SupportTicket, SupportMessage
        ticket = SupportTicket.objects.filter(ticket_id=ticket_id).first()
        if not ticket:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        msgs = SupportMessage.objects.filter(ticket=ticket).order_by("created_at")
        data = [
            {
                "id": m.id,
                "sender": m.sender,
                "text": m.text,
                "time": m.created_at.strftime("%I:%M %p")
            }
            for m in msgs
        ]
        return Response({
            "ticket_id": ticket.ticket_id,
            "status": ticket.status,
            "messages": data
        }, status=status.HTTP_200_OK)

    def post(self, request, ticket_id):
        from vendors.models import SupportTicket, SupportMessage
        ticket = SupportTicket.objects.filter(ticket_id=ticket_id).first()
        if not ticket:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        text = request.data.get("text") or request.data.get("message")
        sender = request.data.get("sender", "admin")
        if not text:
            return Response({"detail": "Message text required."}, status=status.HTTP_400_BAD_REQUEST)

        msg = SupportMessage.objects.create(
            ticket=ticket,
            sender=sender,
            text=text
        )
        return Response({
            "id": msg.id,
            "sender": msg.sender,
            "text": msg.text,
            "time": msg.created_at.strftime("%I:%M %p")
        }, status=status.HTTP_201_CREATED)


class AdminSupportTicketStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, ticket_id):
        from vendors.models import SupportTicket
        ticket = SupportTicket.objects.filter(ticket_id=ticket_id).first()
        if not ticket:
            return Response({"detail": "Ticket not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get("status", "closed")
        ticket.status = new_status
        ticket.save()
        return Response({
            "message": f"Ticket #{ticket.ticket_id} status updated to {new_status}.",
            "status": ticket.status
        }, status=status.HTTP_200_OK)


class AdminDashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        from django.db.models import Sum, Avg, Q
        from django.utils import timezone
        from datetime import timedelta
        from vendors.models import MenuItem, Order, Rating, SupportTicket
        from accounts.models import Notification, User

        today = timezone.now().date()
        start_of_week = today - timedelta(days=7)
        start_of_month = today - timedelta(days=30)

        total_users = User.objects.count()
        total_students = User.objects.filter(role="student").count()
        total_vendors = User.objects.filter(role="vendor").count()
        active_vendors = User.objects.filter(role="vendor", is_active=True).count()
        pending_vendors = User.objects.filter(role="vendor", is_verified=False).count()

        total_orders = Order.objects.count()
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(delivery_status="Confirmed").count()
        preparing_orders = Order.objects.filter(delivery_status__in=["Preparing Food", "Preparing", "Packed", "Picked Up", "Out For Delivery"]).count()
        accepted_orders = Order.objects.filter(delivery_status="Confirmed").count()
        completed_orders = Order.objects.filter(delivery_status="Delivered").count()
        delivered_orders = completed_orders
        cancelled_orders = Order.objects.filter(delivery_status="Cancelled").count()

        total_menu_items = MenuItem.objects.count()
        available_menu_items = MenuItem.objects.filter(is_available=True, is_active=True).count()
        active_menu_items = available_menu_items
        unavailable_menu_items = MenuItem.objects.filter(Q(is_available=False) | Q(is_active=False)).count()

        today_revenue = Order.objects.filter(created_at__date=today, delivery_status="Delivered").aggregate(total=Sum("bill"))["total"] or 0
        weekly_revenue = Order.objects.filter(created_at__date__gte=start_of_week, delivery_status="Delivered").aggregate(total=Sum("bill"))["total"] or 0
        monthly_revenue = Order.objects.filter(created_at__date__gte=start_of_month, delivery_status="Delivered").aggregate(total=Sum("bill"))["total"] or 0
        overall_revenue = Order.objects.filter(delivery_status="Delivered").aggregate(total=Sum("bill"))["total"] or 0

        delivered_count = Order.objects.filter(delivery_status="Delivered").count()
        avg_order_value = round(float(overall_revenue) / delivered_count, 2) if delivered_count > 0 else 0

        total_ratings = Rating.objects.count()
        avg_food = Rating.objects.aggregate(avg=Avg("food_rating"))["avg"] or 0
        avg_service = Rating.objects.aggregate(avg=Avg("service_rating"))["avg"] or 0
        avg_rating = round((float(avg_food) + float(avg_service)) / 2, 2) if total_ratings > 0 else 0

        support_tickets = SupportTicket.objects.filter(status="open").count()
        unread_notifications = Notification.objects.filter(user=request.user, is_read=False).count()

        recent_regs = User.objects.all().order_by("-created_at")[:5]
        recent_registrations_data = [
            {
                "id": r.id,
                "full_name": r.full_name or r.email.split("@")[0],
                "email": r.email,
                "role": r.role,
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for r in recent_regs
        ]

        recent_ord = Order.objects.all().order_by("-created_at")[:5]
        recent_orders_data = []
        for o in recent_ord:
            cust_name = "Offline Walk-up"
            vend_name = "Campus Tiffin Vendor"
            try:
                if o.student:
                    cust_name = o.student.full_name or o.student.email or "Student"
            except Exception:
                pass
            try:
                if o.vendor:
                    vend_name = o.vendor.full_name or o.vendor.email or "Vendor"
            except Exception:
                pass

            recent_orders_data.append({
                "id": o.id,
                "order_id": o.order_id,
                "customer": cust_name,
                "vendor": vend_name,
                "bill": float(o.bill),
                "delivery_status": o.delivery_status,
                "created_at": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else ""
            })

        recent_activities = []
        for o in Order.objects.all().order_by("-created_at")[:3]:
            cust_name = "Walk-up"
            vend_name = "Vendor"
            try:
                if o.student:
                    cust_name = o.student.full_name or o.student.email or "Student"
            except Exception:
                pass
            try:
                if o.vendor:
                    vend_name = o.vendor.full_name or o.vendor.email or "Vendor"
            except Exception:
                pass

            recent_activities.append({
                "type": "order",
                "text": f"New order placed by {cust_name} at {vend_name}",
                "timestamp": o.created_at.strftime("%b %d, %I:%M %p") if o.created_at else "",
                "order_id": o.order_id
            })
        for t in SupportTicket.objects.all().order_by("-created_at")[:3]:
            recent_activities.append({
                "type": "support",
                "text": f"Support Ticket {t.ticket_id} ('{t.title}') created by {t.user_name}",
                "timestamp": t.created_at.strftime("%b %d, %I:%M %p") if t.created_at else "",
                "ticket_id": t.ticket_id
            })
        for r in Rating.objects.all().order_by("-created_at")[:3]:
            st_name = "Student"
            vn_name = "Vendor"
            try:
                if r.student:
                    st_name = r.student.full_name or r.student.email or "Student"
            except Exception:
                pass
            try:
                if r.vendor:
                    vn_name = r.vendor.full_name or r.vendor.email or "Vendor"
            except Exception:
                pass

            recent_activities.append({
                "type": "rating",
                "text": f"{st_name} rated {vn_name} with {r.food_rating}★",
                "timestamp": r.created_at.strftime("%b %d, %I:%M %p") if r.created_at else ""
            })
        
        recent_activities = sorted(recent_activities, key=lambda x: x["timestamp"], reverse=True)[:5]

        return Response({
            "total_users": total_users,
            "total_students": total_students,
            "total_vendors": total_vendors,
            "active_vendors": active_vendors,
            "pending_vendors": pending_vendors,
            "total_orders": total_orders,
            "today_orders": today_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "active_menu_items": active_menu_items,
            "revenue": float(overall_revenue),
            "total_menu_items": total_menu_items,
            "available_menu_items": available_menu_items,
            "unavailable_menu_items": unavailable_menu_items,
            "pending_orders": pending_orders,
            "accepted_orders": accepted_orders,
            "preparing_orders": preparing_orders,
            "completed_orders": completed_orders,
            "today_revenue": float(today_revenue),
            "weekly_revenue": float(weekly_revenue),
            "monthly_revenue": float(monthly_revenue),
            "overall_revenue": float(overall_revenue),
            "avg_order_value": avg_order_value,
            "total_ratings": total_ratings,
            "avg_rating": avg_rating,
            "average_rating": avg_rating,
            "support_tickets": support_tickets,
            "unread_notifications": unread_notifications,
            "recent_registrations": recent_registrations_data,
            "recent_orders": recent_orders_data,
            "recent_activities": recent_activities
        }, status=status.HTTP_200_OK)


class AdminStudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        from accounts.models import User
        from students.models import Cart
        from vendors.models import Order

        students = User.objects.filter(role="student").order_by("-created_at")
        data = []
        for s in students:
            subs_data = []
            try:
                from students.models import Subscription
                subs = Subscription.objects.filter(student=s)
                for sub in subs:
                    v_name = "Vendor"
                    try:
                        if sub.vendor:
                            v_name = sub.vendor.full_name or sub.vendor.email or "Vendor"
                    except Exception:
                        pass
                    subs_data.append({
                        "id": sub.id,
                        "plan_type": sub.plan_type,
                        "vendor_name": v_name,
                        "start_date": sub.start_date.strftime("%Y-%m-%d") if sub.start_date else "",
                        "end_date": sub.end_date.strftime("%Y-%m-%d") if sub.end_date else "",
                        "is_active": sub.is_active,
                        "price": float(sub.price) if sub.price else 0.0
                    })
            except Exception:
                subs_data = []

            cart = s.cart.first() if hasattr(s, "cart") else None
            cart_items = []
            if cart:
                for item in cart.items.all():
                    item_name = "Menu Item"
                    item_price = 0.0
                    try:
                        if item.menu_item:
                            item_name = item.menu_item.name
                            item_price = float(item.menu_item.price)
                    except Exception:
                        pass
                    cart_items.append({
                        "id": item.id,
                        "menu_item_name": item_name,
                        "quantity": item.quantity,
                        "price": item_price
                    })

            orders = Order.objects.filter(student=s).order_by("-created_at")
            orders_data = []
            for o in orders:
                v_name = "Vendor"
                try:
                    if o.vendor:
                        v_name = o.vendor.full_name or o.vendor.email or "Vendor"
                except Exception:
                    pass
                orders_data.append({
                    "id": o.id,
                    "order_id": o.order_id,
                    "vendor_name": v_name,
                    "bill": float(o.bill) if o.bill else 0.0,
                    "delivery_status": o.delivery_status,
                    "created_at": o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else ""
                })

            data.append({
                "id": f"S-{1000 + s.id}",
                "real_id": s.id,
                "name": s.full_name or s.email.split("@")[0],
                "email": s.email,
                "phone": s.phone,
                "is_active": s.is_active,
                "created_at": s.created_at.strftime("%Y-%m-%d %H:%M"),
                "last_login": s.last_login.strftime("%Y-%m-%d %H:%M") if s.last_login else "Never",
                "orders": orders_data,
                "orders_count": len(orders_data),
                "subscriptions": subs_data,
                "subscriptions_count": len(subs_data),
                "cart_items": cart_items,
                "cart_items_count": len(cart_items)
            })
        return Response(data, status=status.HTTP_200_OK)


class AdminManageStudentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, student_id):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        from accounts.models import User
        student = None
        if str(student_id).startswith("S-"):
            try:
                s_id = int(str(student_id).replace("S-", "")) - 1000
                student = User.objects.filter(id=s_id, role="student").first()
            except Exception:
                pass
        if not student:
            student = User.objects.filter(id=student_id, role="student").first()
        if not student:
            student = User.objects.filter(email__iexact=str(student_id), role="student").first()

        if not student:
            return Response({"detail": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get("action")
        if action == "suspend" or action == "deactivate":
            student.is_active = False
            student.save()
            return Response({"message": f"Student {student.email} has been deactivated.", "is_active": False}, status=status.HTTP_200_OK)
        elif action == "restore" or action == "activate":
            student.is_active = True
            student.save()
            return Response({"message": f"Student {student.email} has been activated.", "is_active": True}, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid action specified."}, status=status.HTTP_400_BAD_REQUEST)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from accounts.models import Notification
        notifications = Notification.objects.filter(user=request.user).order_by("-created_at")
        data = [
            {
                "id": n.id,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "unread": not n.is_read,
                "created_at": n.created_at.strftime("%Y-%m-%d %H:%M"),
                "time": n.created_at.strftime("%b %d, %I:%M %p")
            }
            for n in notifications
        ]
        return Response(data, status=status.HTTP_200_OK)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, notification_id):
        from accounts.models import Notification
        notification = Notification.objects.filter(id=notification_id, user=request.user).first()
        if not notification:
            return Response({"detail": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        notification.is_read = True
        notification.save()
        return Response({"message": "Notification marked as read."}, status=status.HTTP_200_OK)


class NotificationMarkReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from accounts.models import Notification
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read."}, status=status.HTTP_200_OK)


class AdminBroadcastView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            return Response({"detail": "Permission denied."}, status=status.HTTP_403_FORBIDDEN)

        message = request.data.get("message", "").strip()
        title = request.data.get("title", "System Broadcast").strip()
        if not message:
            return Response({"detail": "Message body is required."}, status=status.HTTP_400_BAD_REQUEST)

        from accounts.models import User, Notification
        recipients = User.objects.exclude(role="admin")
        notifications = [
            Notification(user=u, title=title, message=message)
            for u in recipients
        ]
        Notification.objects.bulk_create(notifications)

        return Response({"message": f"Broadcast sent to {len(notifications)} users successfully."}, status=status.HTTP_200_OK)
