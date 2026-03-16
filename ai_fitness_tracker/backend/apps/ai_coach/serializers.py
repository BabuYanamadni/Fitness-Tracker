"""
AI Coach App - Serializers
"""
from rest_framework import serializers
from .models import AIConversation, AIMessage, AIWorkoutPlanRequest


class AIMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AIMessage
        fields = ('id', 'role', 'content', 'created_at')
        read_only_fields = fields


class AIConversationSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    message_count = serializers.SerializerMethodField()

    class Meta:
        model  = AIConversation
        fields = ('id', 'title', 'created_at', 'updated_at', 'last_message', 'message_count')
        read_only_fields = fields

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return AIMessageSerializer(msg).data if msg else None

    def get_message_count(self, obj):
        return obj.messages.count()


class ChatMessageInputSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)


class GeneratePlanSerializer(serializers.Serializer):
    goals       = serializers.CharField(max_length=1000)
    constraints = serializers.CharField(max_length=500, required=False, allow_blank=True)


class AIWorkoutPlanRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model  = AIWorkoutPlanRequest
        fields = ('id', 'prompt', 'response', 'status', 'created_at')
        read_only_fields = fields
