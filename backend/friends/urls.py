from django.urls import path
from . import views

app_name = 'friends'

urlpatterns = [
    path('request/send/<int:user_id>/', views.SendFriendRequestView.as_view(), name='send_request'),
    path('request/accept/<int:request_id>/', views.AcceptFriendRequestView.as_view(), name='accept_request'),
    path('request/reject/<int:request_id>/', views.RejectFriendRequestView.as_view(), name='reject_request'),
    path('request/cancel/<int:user_id>/', views.CancelFriendRequestView.as_view(), name='cancel_request'),
    path('request/incoming/', views.IncomingFriendRequestsView.as_view(), name='incoming_requests'),
    path('request/outgoing/', views.OutgoingFriendRequestsView.as_view(), name='outgoing_requests'),
    
    path('my-friends/', views.MyFriendsView.as_view(), name='my_friends'),
    path('remove/<int:user_id>/', views.RemoveFriendView.as_view(), name='remove_friend'),
    
    path('subscriptions/', views.MySubscriptionsView.as_view(), name='subscriptions'),
    path('subscribers/', views.MySubscribersView.as_view(), name='subscribers'),

    path('block/<int:user_id>/', views.BlockUserView.as_view(), name='block_user'),
    path('unblock/<int:user_id>/', views.UnblockUserView.as_view(), name='unblock_user'),
    path('blocked/', views.BlockedUsersView.as_view(), name='blocked_users'),
    
    path('notifications/', views.InternalNotificationsView.as_view(), name='notifications'),
    path('notifications/<int:notification_id>/read/', views.MarkNotificationReadView.as_view(), name='mark_read'),
    path('notifications/read-all/', views.MarkAllNotificationsReadView.as_view(), name='mark_all_read'),
    path('notifications/unread-count/', views.UnreadNotificationsCountView.as_view(), name='unread_count'),
    
    path('status/<int:user_id>/', views.FriendshipStatusView.as_view(), name='friendship_status'),
]