"""
Analytics App - Views
"""
from datetime import date, timedelta
from django.db.models import Avg, Sum, Count
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import DailyStats, Achievement, UserAchievement
from .serializers import DailyStatsSerializer, AchievementSerializer, UserAchievementSerializer


class DailyStatsViewSet(viewsets.ModelViewSet):
    serializer_class   = DailyStatsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DailyStats.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        stats, _ = DailyStats.objects.get_or_create(user=request.user, date=date.today())
        return Response(DailyStatsSerializer(stats).data)

    @action(detail=False, methods=['get'], url_path='weekly')
    def weekly(self, request):
        end   = date.today()
        start = end - timedelta(days=6)
        stats = self.get_queryset().filter(date__range=[start, end])
        return Response(DailyStatsSerializer(stats, many=True).data)

    @action(detail=False, methods=['get'], url_path='monthly')
    def monthly(self, request):
        end   = date.today()
        start = end - timedelta(days=29)
        stats = self.get_queryset().filter(date__range=[start, end])
        return Response(DailyStatsSerializer(stats, many=True).data)


class OverviewView(APIView):
    """High-level dashboard overview stats."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user  = request.user
        today = date.today()
        week_start = today - timedelta(days=6)

        from apps.workouts.models import WorkoutSession
        from apps.users.models import UserWeightLog

        weekly_workouts = WorkoutSession.objects.filter(
            user=user, status='completed',
            completed_at__date__gte=week_start,
        )
        total_sessions = WorkoutSession.objects.filter(user=user, status='completed').count()

        # Streak calculation
        streak = 0
        check_date = today
        while WorkoutSession.objects.filter(user=user, status='completed', completed_at__date=check_date).exists():
            streak    += 1
            check_date = check_date - timedelta(days=1)

        # Weight progress
        weight_logs = UserWeightLog.objects.filter(user=user).order_by('logged_at')[:2]
        weight_change = None
        if weight_logs.count() == 2:
            weight_change = round(weight_logs[1].weight_kg - weight_logs[0].weight_kg, 2)

        weekly_stats = DailyStats.objects.filter(user=user, date__gte=week_start).aggregate(
            avg_calories_burned=Avg('calories_burned'),
            total_duration=Sum('total_duration_min'),
            avg_water=Avg('water_consumed_ml'),
        )

        return Response({
            'total_workouts':      total_sessions,
            'weekly_workouts':     weekly_workouts.count(),
            'current_streak_days': streak,
            'current_weight':      user.weight_kg,
            'weight_change_kg':    weight_change,
            'bmi':                 user.bmi,
            'weekly_avg_calories_burned': round(weekly_stats['avg_calories_burned'] or 0, 1),
            'weekly_total_duration_min':  weekly_stats['total_duration'] or 0,
            'weekly_avg_water_ml':        round(weekly_stats['avg_water'] or 0, 1),
            'achievements_count':  UserAchievement.objects.filter(user=user).count(),
        })


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Achievement.objects.all()
    serializer_class   = AchievementSerializer
    permission_classes = [IsAuthenticated]


class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class   = UserAchievementSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserAchievement.objects.filter(user=self.request.user)
