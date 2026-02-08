from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from users.permissions import IsApprovedUser
from users.models import User
from friends.models import BlockedUser
from .models import Conversation, Message
from .serializers import (
    ConversationListSerializer, MessageSerializer, MessageCreateSerializer
)


class ConversationListView(generics.ListAPIView):
    """Список диалогов текущего пользователя"""
    permission_classes = [IsAuthenticated, IsApprovedUser]
    serializer_class = ConversationListSerializer

    def get_queryset(self):
        return Conversation.objects.filter(
            Q(participant1=self.request.user) | Q(participant2=self.request.user)
        )


class ConversationDetailView(views.APIView):
    """Получить или создать диалог с пользователем"""
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def get(self, request, username):
        other_user = get_object_or_404(User, username=username, is_approved=True)
        if other_user == request.user:
            return Response({'error': 'Нельзя начать диалог с собой'}, status=status.HTTP_400_BAD_REQUEST)
        if BlockedUser.objects.filter(
            Q(blocker=request.user, blocked=other_user) |
            Q(blocker=other_user, blocked=request.user)
        ).exists():
            return Response({'error': 'Действие невозможно'}, status=status.HTTP_403_FORBIDDEN)
        conv = Conversation.get_or_create_between(request.user, other_user)
        serializer = ConversationListSerializer(conv, context={'request': request})
        return Response(serializer.data)


class MessageListView(generics.ListAPIView):
    """Сообщения в диалоге"""
    permission_classes = [IsAuthenticated, IsApprovedUser]
    serializer_class = MessageSerializer

    def get_queryset(self):
        conv_id = self.kwargs['conversation_id']
        conv = get_object_or_404(Conversation, id=conv_id)
        if self.request.user not in [conv.participant1, conv.participant2]:
            return Message.objects.none()
        return Message.objects.filter(conversation=conv).select_related('sender')


class MessageCreateView(views.APIView):
    """Отправить сообщение"""
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def post(self, request, conversation_id):
        conv = get_object_or_404(Conversation, id=conversation_id)
        if request.user not in [conv.participant1, conv.participant2]:
            return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
        other = conv.get_other_participant(request.user)
        if BlockedUser.objects.filter(
            Q(blocker=request.user, blocked=other) |
            Q(blocker=other, blocked=request.user)
        ).exists():
            return Response({'error': 'Действие невозможно'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MessageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            content=serializer.validated_data['content']
        )
        conv.save()  # обновить updated_at
        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class MessageMarkReadView(views.APIView):
    """Отметить сообщения как прочитанные"""
    permission_classes = [IsAuthenticated, IsApprovedUser]

    def post(self, request, conversation_id):
        conv = get_object_or_404(Conversation, id=conversation_id)
        if request.user not in [conv.participant1, conv.participant2]:
            return Response({'error': 'Нет доступа'}, status=status.HTTP_403_FORBIDDEN)
        Message.objects.filter(
            conversation=conv
        ).exclude(sender=request.user).update(is_read=True, read_at=timezone.now())
        return Response({'status': 'ok'})
