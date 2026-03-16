# apps/workouts/admin.py
from django.contrib import admin
from .models import ExerciseCategory, Exercise, WorkoutPlan, WorkoutSession, WorkoutExercise, ExerciseSet

admin.site.register(ExerciseCategory)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display  = ('name', 'primary_muscle', 'difficulty', 'calories_per_min', 'is_active')
    list_filter   = ('primary_muscle', 'difficulty', 'is_active')
    search_fields = ('name', 'equipment')

@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display  = ('user', 'name', 'scheduled_date', 'status', 'duration_minutes', 'calories_burned')
    list_filter   = ('status', 'scheduled_date')
    search_fields = ('user__email', 'name')

admin.site.register(WorkoutPlan)
admin.site.register(WorkoutExercise)
admin.site.register(ExerciseSet)
