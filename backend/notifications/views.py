from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.shortcuts import get_object_or_404
from users.permissions import IsApprovedUser
from django.contrib.admin.views.decorators import staff_member_required
from rest_framework.permissions import IsAdminUser as DjangoIsAdminUser

from .models import Notification, UserNotificationStatus
from .serializers import (
    NotificationSerializer,
    NotificationCreateUpdateSerializer,
    UserNotificationStatusSerializer
)


class ActiveNotificationsView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return Notification.objects.filter(is_active=True)


class DismissNotificationView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id)
        
        status_obj, created = UserNotificationStatus.objects.get_or_create(
            user=request.user,
            notification=notification
        )
        
        status_obj.is_dismissed = True
        status_obj.dismissed_at = timezone.now()
        
        if not status_obj.is_read:
            status_obj.is_read = True
            status_obj.read_at = timezone.now()
        
        status_obj.save()
        
        return Response({
            'message': 'Уведомление закрыто',
            'notification_id': notification_id
        }, status=status.HTTP_200_OK)


class MarkNotificationReadView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id)
        
        status_obj, created = UserNotificationStatus.objects.get_or_create(
            user=request.user,
            notification=notification
        )
        
        if not status_obj.is_read:
            status_obj.is_read = True
            status_obj.read_at = timezone.now()
            status_obj.save()
        
        return Response({
            'message': 'Уведомление прочитано',
            'notification_id': notification_id
        }, status=status.HTTP_200_OK)


class UnreadNotificationsCountView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get(self, request):
        active_notifications = Notification.objects.filter(is_active=True)
        
        dismissed_ids = UserNotificationStatus.objects.filter(
            user=request.user,
            is_dismissed=True
        ).values_list('notification_id', flat=True)
        
        unread_count = active_notifications.exclude(id__in=dismissed_ids).count()
        
        return Response({
            'unread_count': unread_count
        }, status=status.HTTP_200_OK)


class AdminNotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = Notification.objects.all()


class AdminNotificationCreateView(generics.CreateAPIView):
    serializer_class = NotificationCreateUpdateSerializer
    permission_classes = [DjangoIsAdminUser]
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AdminNotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationCreateUpdateSerializer
    permission_classes = [DjangoIsAdminUser]
    queryset = Notification.objects.all()


class AdminNotificationStatsView(views.APIView):
    permission_classes = [DjangoIsAdminUser]
    
    def get(self, request, notification_id):
        notification = get_object_or_404(Notification, id=notification_id)
        
        total_users = UserNotificationStatus.objects.filter(
            notification=notification
        ).count()
        
        read_count = UserNotificationStatus.objects.filter(
            notification=notification,
            is_read=True
        ).count()
        
        dismissed_count = UserNotificationStatus.objects.filter(
            notification=notification,
            is_dismissed=True
        ).count()
        
        return Response({
            'notification_id': notification_id,
            'total_interactions': total_users,
            'read_count': read_count,
            'dismissed_count': dismissed_count,
        }, status=status.HTTP_200_OK)