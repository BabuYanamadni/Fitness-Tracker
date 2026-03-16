"""
Analytics App - Serializers
"""
from rest_framework import serializers
from .models import DailyStats, Achievement, UserAchievement


class DailyStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model  = DailyStats
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Achievement
        fields = '__all__'


class UserAchievementSerializer(serializers.ModelSerializer):
    achievement = AchievementSerializer(read_only=True)

    class Meta:
        model  = UserAchievement
        fields = ('id', 'achievement', 'earned_at')
        read_only_fields = fields
