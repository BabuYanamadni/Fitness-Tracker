"""
AI Coach App - Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AIConversation, AIMessage, AIWorkoutPlanRequest
from .services import get_ai_response, generate_workout_plan
from .serializers import (
    AIConversationSerializer, AIMessageSerializer, AIWorkoutPlanRequestSerializer,
    ChatMessageInputSerializer, GeneratePlanSerializer,
)


class AIConversationViewSet(viewsets.ModelViewSet):
    serializer_class   = AIConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return AIConversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        conversation = self.get_object()
        msgs = conversation.messages.all()
        return Response(AIMessageSerializer(msgs, many=True).data)

    @action(detail=True, methods=['post'])
    def chat(self, request, pk=None):
        conversation = self.get_object()
        serializer   = ChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_message = serializer.validated_data['message']

        # Save user message
        AIMessage.objects.create(
            conversation=conversation,
            role='user',
            content=user_message,
        )

        # Build history for context
        history = [
            {'role': m.role, 'content': m.content}
            for m in conversation.messages.all()[:-1]
        ]

        # Get AI response
        try:
            ai_reply = get_ai_response(request.user, user_message, history)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # Save assistant message
        assistant_msg = AIMessage.objects.create(
            conversation=conversation,
            role='assistant',
            content=ai_reply,
        )

        # Update conversation title if first exchange
        if conversation.messages.count() == 2 and not conversation.title:
            conversation.title = user_message[:80]
            conversation.save(update_fields=['title'])

        return Response(AIMessageSerializer(assistant_msg).data)


class NewChatView(APIView):
    """Create conversation + send first message in one call."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChatMessageInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_message = serializer.validated_data['message']

        conversation = AIConversation.objects.create(
            user=request.user,
            title=user_message[:80],
        )
        AIMessage.objects.create(conversation=conversation, role='user', content=user_message)

        try:
            ai_reply = get_ai_response(request.user, user_message, [])
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        assistant_msg = AIMessage.objects.create(
            conversation=conversation, role='assistant', content=ai_reply,
        )

        return Response({
            'conversation_id': conversation.id,
            'reply': AIMessageSerializer(assistant_msg).data,
        }, status=status.HTTP_201_CREATED)


class GenerateWorkoutPlanView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = GeneratePlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        req = AIWorkoutPlanRequest.objects.create(
            user=request.user,
            prompt=serializer.validated_data['goals'],
            status='processing',
        )

        try:
            plan_text = generate_workout_plan(
                request.user,
                serializer.validated_data['goals'],
                serializer.validated_data.get('constraints', ''),
            )
            req.response = plan_text
            req.status   = 'completed'
            req.save()
            return Response({'plan': plan_text, 'request_id': req.id})
        except Exception as e:
            req.status = 'failed'
            req.save()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
