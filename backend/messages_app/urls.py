from django.urls import path
from . import views

app_name = 'messages_app'

urlpatterns = [
    path('conversations/', views.ConversationListView.as_view(), name='conversation_list'),
    path('conversation/<str:username>/', views.ConversationDetailView.as_view(), name='conversation_detail'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message_list'),
    path('conversations/<int:conversation_id>/messages/send/', views.MessageCreateView.as_view(), name='message_send'),
    path('conversations/<int:conversation_id>/read/', views.MessageMarkReadView.as_view(), name='message_mark_read'),
]
