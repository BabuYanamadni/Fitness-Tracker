"""
Analytics App - Models
"""
from django.db import models
from django.conf import settings


class DailyStats(models.Model):
    """Aggregated daily statistics per user."""
    user              = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='daily_stats')
    date              = models.DateField()
    workouts_completed = models.PositiveIntegerField(default=0)
    total_duration_min = models.PositiveIntegerField(default=0)
    calories_burned   = models.FloatField(default=0)
    calories_consumed  = models.FloatField(default=0)
    water_consumed_ml  = models.FloatField(default=0)
    steps             = models.PositiveIntegerField(default=0)
    weight_kg         = models.FloatField(null=True, blank=True)
    sleep_hours       = models.FloatField(null=True, blank=True)
    mood_score        = models.PositiveIntegerField(null=True, blank=True, help_text='1-10 mood rating')
    created_at        = models.DateTimeField(auto_now_add=True)
    updated_at        = models.DateTimeField(auto_now=True)

    class Meta:
        db_table   = 'daily_stats'
        unique_together = [['user', 'date']]
        ordering   = ['-date']

    def __str__(self):
        return f'{self.user.email} - {self.date}'


class Achievement(models.Model):
    """Badges and milestones."""
    CATEGORY_CHOICES = [
        ('workout',   'Workout'),
        ('nutrition', 'Nutrition'),
        ('streak',    'Streak'),
        ('weight',    'Weight'),
        ('milestone', 'Milestone'),
    ]

    name        = models.CharField(max_length=200)
    description = models.TextField()
    category    = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    icon        = models.CharField(max_length=100, blank=True)
    points      = models.PositiveIntegerField(default=10)

    class Meta:
        db_table = 'achievements'


class UserAchievement(models.Model):
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    earned_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'user_achievements'
        unique_together = [['user', 'achievement']]
        ordering        = ['-earned_at']
