from django.urls import path
from . import views
from friends.views import InternalNotificationsView

app_name = 'notifications'

urlpatterns = [
    
    path('', InternalNotificationsView.as_view(), name='user_notifications'),

    path('active/', views.ActiveNotificationsView.as_view(), name='active_notifications'),
    path('<int:notification_id>/dismiss/', views.DismissNotificationView.as_view(), name='dismiss_notification'),
    path('<int:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark_read'),
    path('unread-count/', views.UnreadNotificationsCountView.as_view(), name='unread_count'),

    path('admin/list/', views.AdminNotificationListView.as_view(), name='admin_list'),
    path('admin/create/', views.AdminNotificationCreateView.as_view(), name='admin_create'),
    path('admin/<int:pk>/', views.AdminNotificationDetailView.as_view(), name='admin_detail'),
    path('admin/<int:notification_id>/stats/', views.AdminNotificationStatsView.as_view(), name='admin_stats'),
]