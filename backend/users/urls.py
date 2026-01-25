from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

app_name = 'users'

urlpatterns = [
    # JWT Authentication
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Registration with email verification
    path('register/', views.RegistrationRequestCreateView.as_view(), name='register'),
    path('verify-email/', views.EmailVerificationView.as_view(), name='verify_email'),
    path('resend-code/', views.ResendVerificationCodeView.as_view(), name='resend_code'),
    
    # User Profile
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('profile/<str:username>/', views.UserProfileView.as_view(), name='user_profile'),
    path('profile/update/', views.ProfileUpdateView.as_view(), name='profile_update'),
]