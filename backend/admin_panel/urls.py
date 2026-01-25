from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # User Management
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('users/create/', views.UserCreateView.as_view(), name='user_create'),
    path('users/<int:pk>/', views.UserDetailView.as_view(), name='user_detail'),
    path('users/<int:pk>/approve/', views.UserApproveView.as_view(), name='user_approve'),
    path('users/<int:pk>/delete/', views.UserDeleteView.as_view(), name='user_delete'),
    
    # Registration Requests
    path('requests/', views.RegistrationRequestListView.as_view(), name='request_list'),
    path('requests/<int:pk>/', views.RegistrationRequestDetailView.as_view(), name='request_detail'),
    path('requests/<int:pk>/approve/', views.RegistrationRequestApproveView.as_view(), name='request_approve'),
    path('requests/<int:pk>/reject/', views.RegistrationRequestRejectView.as_view(), name='request_reject'),
    path('requests/<int:pk>/delete/', views.RegistrationRequestDeleteView.as_view(), name='request_delete'),
    
    # Statistics
    path('stats/', views.StatsView.as_view(), name='stats'),
]