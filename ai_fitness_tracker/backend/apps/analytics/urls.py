from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DailyStatsViewSet, OverviewView, AchievementViewSet, UserAchievementViewSet

router = DefaultRouter()
router.register(r'daily-stats',       DailyStatsViewSet,      basename='daily-stats')
router.register(r'achievements',      AchievementViewSet,     basename='achievement')
router.register(r'my-achievements',   UserAchievementViewSet, basename='user-achievement')

urlpatterns = [
    path('overview/', OverviewView.as_view(), name='analytics-overview'),
    path('', include(router.urls)),
]
