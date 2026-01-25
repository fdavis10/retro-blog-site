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
    
    # Statistics
    path('stats/', views.StatsView.as_view(), name='stats'),
]