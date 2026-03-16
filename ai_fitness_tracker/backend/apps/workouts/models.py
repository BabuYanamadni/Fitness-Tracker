"""
Workouts App - Models
"""
from django.db import models
from django.conf import settings


class ExerciseCategory(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon        = models.CharField(max_length=50, blank=True, help_text='Icon name/emoji')

    class Meta:
        db_table  = 'exercise_categories'
        verbose_name_plural = 'Exercise Categories'

    def __str__(self):
        return self.name


class Exercise(models.Model):
    DIFFICULTY_CHOICES = [
        ('beginner',     'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced',     'Advanced'),
    ]
    MUSCLE_GROUP_CHOICES = [
        ('chest',      'Chest'),
        ('back',       'Back'),
        ('shoulders',  'Shoulders'),
        ('arms',       'Arms'),
        ('core',       'Core'),
        ('legs',       'Legs'),
        ('glutes',     'Glutes'),
        ('full_body',  'Full Body'),
        ('cardio',     'Cardio'),
    ]

    name              = models.CharField(max_length=200)
    category          = models.ForeignKey(ExerciseCategory, on_delete=models.SET_NULL, null=True)
    primary_muscle    = models.CharField(max_length=20, choices=MUSCLE_GROUP_CHOICES)
    secondary_muscles = models.JSONField(default=list, blank=True)
    difficulty        = models.CharField(max_length=15, choices=DIFFICULTY_CHOICES, default='beginner')
    equipment         = models.CharField(max_length=200, blank=True)
    instructions      = models.TextField(blank=True)
    video_url         = models.URLField(blank=True)
    calories_per_min  = models.FloatField(default=5.0, help_text='Estimated calories burned per minute')
    is_active         = models.BooleanField(default=True)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exercises'

    def __str__(self):
        return self.name


class WorkoutPlan(models.Model):
    GOAL_CHOICES = [
        ('weight_loss',  'Weight Loss'),
        ('muscle_gain',  'Muscle Gain'),
        ('endurance',    'Endurance'),
        ('flexibility',  'Flexibility'),
        ('general',      'General Fitness'),
    ]

    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_plans')
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    goal        = models.CharField(max_length=20, choices=GOAL_CHOICES)
    duration_weeks = models.PositiveIntegerField(default=4)
    days_per_week  = models.PositiveIntegerField(default=3)
    is_ai_generated = models.BooleanField(default=False)
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'workout_plans'

    def __str__(self):
        return f'{self.user.email} - {self.name}'


class WorkoutSession(models.Model):
    STATUS_CHOICES = [
        ('planned',    'Planned'),
        ('in_progress','In Progress'),
        ('completed',  'Completed'),
        ('skipped',    'Skipped'),
    ]

    user            = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workout_sessions')
    plan            = models.ForeignKey(WorkoutPlan, on_delete=models.SET_NULL, null=True, blank=True)
    name            = models.CharField(max_length=200)
    scheduled_date  = models.DateField()
    started_at      = models.DateTimeField(null=True, blank=True)
    completed_at    = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    calories_burned  = models.FloatField(null=True, blank=True)
    status          = models.CharField(max_length=15, choices=STATUS_CHOICES, default='planned')
    notes           = models.TextField(blank=True)
    rating          = models.PositiveIntegerField(null=True, blank=True, help_text='1-5 rating')
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'workout_sessions'
        ordering = ['-scheduled_date']

    def __str__(self):
        return f'{self.user.email} - {self.name} on {self.scheduled_date}'


class WorkoutExercise(models.Model):
    """Exercises within a workout session."""
    session    = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name='exercises')
    exercise   = models.ForeignKey(Exercise, on_delete=models.CASCADE)
    order      = models.PositiveIntegerField(default=1)
    sets       = models.PositiveIntegerField(default=3)
    reps       = models.PositiveIntegerField(null=True, blank=True)
    weight_kg  = models.FloatField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True, help_text='For timed exercises')
    rest_seconds = models.PositiveIntegerField(default=60)
    notes      = models.TextField(blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        db_table = 'workout_exercises'
        ordering = ['order']

    def __str__(self):
        return f'{self.session} - {self.exercise.name}'


class ExerciseSet(models.Model):
    """Actual logged sets for an exercise in a session."""
    workout_exercise = models.ForeignKey(WorkoutExercise, on_delete=models.CASCADE, related_name='logged_sets')
    set_number       = models.PositiveIntegerField()
    reps_completed   = models.PositiveIntegerField(null=True, blank=True)
    weight_kg        = models.FloatField(null=True, blank=True)
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    rpe              = models.PositiveIntegerField(null=True, blank=True, help_text='Rate of Perceived Exertion 1-10')
    logged_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'exercise_sets'
        ordering = ['set_number']
