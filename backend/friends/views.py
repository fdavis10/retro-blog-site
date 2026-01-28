from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from users.permissions import IsApprovedUser
from users.models import User
from .models import FriendRequest, Friendship, Subscription, BlockedUser, InternalNotification
from .serializers import (
    FriendRequestSerializer, FriendshipSerializer, 
    SubscriptionSerializer, BlockedUserSerializer,
    InternalNotificationSerializer
)


class SendFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, user_id):
        to_user = get_object_or_404(User, id=user_id)
        
        if to_user == request.user:
            return Response({'error': 'Нельзя отправить заявку самому себе'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if BlockedUser.objects.filter(
            Q(blocker=request.user, blocked=to_user) | 
            Q(blocker=to_user, blocked=request.user)
        ).exists():
            return Response({'error': 'Действие невозможно'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        if Friendship.objects.filter(
            Q(user1=request.user, user2=to_user) | 
            Q(user1=to_user, user2=request.user)
        ).exists():
            return Response({'error': 'Вы уже друзья'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        existing_request = FriendRequest.objects.filter(
            from_user=request.user, 
            to_user=to_user, 
            status='pending'
        ).first()
        
        if existing_request:
            return Response({'error': 'Заявка уже отправлена'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        friend_request = FriendRequest.objects.create(
            from_user=request.user,
            to_user=to_user
        )
        
        Subscription.objects.get_or_create(
            subscriber=request.user,
            subscribed_to=to_user
        )
        
        return Response({
            'message': 'Заявка отправлена',
            'request': FriendRequestSerializer(friend_request).data
        }, status=status.HTTP_201_CREATED)


class AcceptFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, request_id):
        friend_request = get_object_or_404(
            FriendRequest, 
            id=request_id, 
            to_user=request.user,
            status='pending'
        )

        friend_request.status = 'accepted'
        friend_request.save()
        
        user1, user2 = sorted([request.user, friend_request.from_user], key=lambda u: u.id)
        Friendship.objects.get_or_create(user1=user1, user2=user2)
        
        Subscription.objects.get_or_create(
            subscriber=request.user,
            subscribed_to=friend_request.from_user
        )
        
        return Response({
            'message': 'Заявка принята',
            'request': FriendRequestSerializer(friend_request).data
        })


class RejectFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, request_id):
        friend_request = get_object_or_404(
            FriendRequest, 
            id=request_id, 
            to_user=request.user,
            status='pending'
        )
        
        friend_request.status = 'rejected'
        friend_request.save()
        
        return Response({
            'message': 'Заявка отклонена',
            'request': FriendRequestSerializer(friend_request).data
        })


class CancelFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def delete(self, request, user_id):
        to_user = get_object_or_404(User, id=user_id)
        
        friend_request = get_object_or_404(
            FriendRequest,
            from_user=request.user,
            to_user=to_user,
            status='pending'
        )
        
        friend_request.delete()
        
        Subscription.objects.filter(
            subscriber=request.user,
            subscribed_to=to_user
        ).delete()
        
        return Response({'message': 'Заявка отменена'})


class RemoveFriendView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def delete(self, request, user_id):
        friend = get_object_or_404(User, id=user_id)
        
        Friendship.objects.filter(
            Q(user1=request.user, user2=friend) | 
            Q(user1=friend, user2=request.user)
        ).delete()
        
        return Response({'message': 'Пользователь удален из друзей'})


class MyFriendsView(generics.ListAPIView):
    serializer_class = FriendshipSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return Friendship.objects.filter(
            Q(user1=self.request.user) | Q(user2=self.request.user)
        )


class MySubscriptionsView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return Subscription.objects.filter(subscriber=self.request.user)


class MySubscribersView(generics.ListAPIView):
    serializer_class = SubscriptionSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return Subscription.objects.filter(subscribed_to=self.request.user)


class IncomingFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return FriendRequest.objects.filter(
            to_user=self.request.user,
            status='pending'
        )


class OutgoingFriendRequestsView(generics.ListAPIView):
    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return FriendRequest.objects.filter(
            from_user=self.request.user,
            status='pending'
        )


class BlockUserView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, user_id):
        blocked = get_object_or_404(User, id=user_id)
        
        if blocked == request.user:
            return Response({'error': 'Нельзя заблокировать самого себя'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        BlockedUser.objects.get_or_create(blocker=request.user, blocked=blocked)
        
        Friendship.objects.filter(
            Q(user1=request.user, user2=blocked) | 
            Q(user1=blocked, user2=request.user)
        ).delete()
        
        Subscription.objects.filter(
            Q(subscriber=request.user, subscribed_to=blocked) |
            Q(subscriber=blocked, subscribed_to=request.user)
        ).delete()
        
        FriendRequest.objects.filter(
            Q(from_user=request.user, to_user=blocked) |
            Q(from_user=blocked, to_user=request.user)
        ).delete()
        
        return Response({'message': 'Пользователь заблокирован'})


class UnblockUserView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def delete(self, request, user_id):
        blocked = get_object_or_404(User, id=user_id)
        
        BlockedUser.objects.filter(
            blocker=request.user,
            blocked=blocked
        ).delete()
        
        return Response({'message': 'Пользователь разблокирован'})


class BlockedUsersView(generics.ListAPIView):
    serializer_class = BlockedUserSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return BlockedUser.objects.filter(blocker=self.request.user)


class InternalNotificationsView(generics.ListAPIView):
    serializer_class = InternalNotificationSerializer
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get_queryset(self):
        return InternalNotification.objects.filter(user=self.request.user)


class MarkNotificationReadView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request, notification_id):
        notification = get_object_or_404(
            InternalNotification,
            id=notification_id,
            user=request.user
        )
        
        notification.is_read = True
        notification.save()
        
        return Response({'message': 'Уведомление прочитано'})


class MarkAllNotificationsReadView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def post(self, request):
        InternalNotification.objects.filter(
            user=request.user,
            is_read=False
        ).update(is_read=True)
        
        return Response({'message': 'Все уведомления прочитаны'})


class UnreadNotificationsCountView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get(self, request):
        count = InternalNotification.objects.filter(
            user=request.user,
            is_read=False
        ).count()
        
        return Response({'count': count})


class FriendshipStatusView(views.APIView):
    permission_classes = [IsAuthenticated, IsApprovedUser]
    
    def get(self, request, user_id):
        target_user = get_object_or_404(User, id=user_id)
        
        is_blocked = BlockedUser.objects.filter(
            blocker=request.user,
            blocked=target_user
        ).exists()
        
        blocked_by = BlockedUser.objects.filter(
            blocker=target_user,
            blocked=request.user
        ).exists()
        
        is_friend = Friendship.objects.filter(
            Q(user1=request.user, user2=target_user) |
            Q(user1=target_user, user2=request.user)
        ).exists()
        
        is_subscribed = Subscription.objects.filter(
            subscriber=request.user,
            subscribed_to=target_user
        ).exists()
        
        is_subscriber = Subscription.objects.filter(
            subscriber=target_user,
            subscribed_to=request.user
        ).exists()
        
        sent_request = FriendRequest.objects.filter(
            from_user=request.user,
            to_user=target_user,
            status='pending'
        ).exists()
        
        received_request = FriendRequest.objects.filter(
            from_user=target_user,
            to_user=request.user,
            status='pending'
        ).exists()
        
        return Response({
            'is_friend': is_friend,
            'is_blocked': is_blocked,
            'blocked_by': blocked_by,
            'is_subscribed': is_subscribed,
            'is_subscriber': is_subscriber,
            'sent_request': sent_request,
            'received_request': received_request,
        })