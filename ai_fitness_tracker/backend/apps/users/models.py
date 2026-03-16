"""
Users App - Models
Custom User model with fitness profile fields.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Extended user with fitness profile."""

    GENDER_CHOICES = [('M', 'Male'), ('F', 'Female'), ('O', 'Other')]
    FITNESS_GOAL_CHOICES = [
        ('weight_loss',   'Weight Loss'),
        ('muscle_gain',   'Muscle Gain'),
        ('endurance',     'Endurance'),
        ('flexibility',   'Flexibility'),
        ('general',       'General Fitness'),
    ]
    FITNESS_LEVEL_CHOICES = [
        ('beginner',      'Beginner'),
        ('intermediate',  'Intermediate'),
        ('advanced',      'Advanced'),
    ]

    email          = models.EmailField(unique=True)
    date_of_birth  = models.DateField(null=True, blank=True)
    gender         = models.CharField(max_length=1, choices=GENDER_CHOICES, blank=True)
    height_cm      = models.FloatField(null=True, blank=True, help_text='Height in centimeters')
    weight_kg      = models.FloatField(null=True, blank=True, help_text='Weight in kilograms')
    fitness_goal   = models.CharField(max_length=20, choices=FITNESS_GOAL_CHOICES, default='general')
    fitness_level  = models.CharField(max_length=15, choices=FITNESS_LEVEL_CHOICES, default='beginner')
    profile_image  = models.ImageField(upload_to='profile_images/', null=True, blank=True)
    bio            = models.TextField(blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)
    updated_at     = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email

    @property
    def bmi(self):
        if self.height_cm and self.weight_kg:
            height_m = self.height_cm / 100
            return round(self.weight_kg / (height_m ** 2), 2)
        return None

    @property
    def age(self):
        if self.date_of_birth:
            from datetime import date
            today = date.today()
            return today.year - self.date_of_birth.year - (
                (today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day)
            )
        return None


class UserWeightLog(models.Model):
    """Track weight changes over time."""
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='weight_logs')
    weight_kg  = models.FloatField()
    logged_at  = models.DateTimeField(auto_now_add=True)
    note       = models.CharField(max_length=255, blank=True)

    class Meta:
        db_table  = 'user_weight_logs'
        ordering  = ['-logged_at']

    def __str__(self):
        return f'{self.user.email} - {self.weight_kg}kg on {self.logged_at.date()}'
