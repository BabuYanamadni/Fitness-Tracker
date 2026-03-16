# apps/analytics/admin.py
from django.contrib import admin
from .models import DailyStats, Achievement, UserAchievement

@admin.register(DailyStats)
class DailyStatsAdmin(admin.ModelAdmin):
    list_display  = ('user', 'date', 'workouts_completed', 'calories_burned', 'calories_consumed')
    list_filter   = ('date',)
    search_fields = ('user__email',)

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'points')

admin.site.register(UserAchievement)
