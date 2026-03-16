"""
Workouts App - Serializers
"""
from rest_framework import serializers
from .models import (
    ExerciseCategory, Exercise, WorkoutPlan,
    WorkoutSession, WorkoutExercise, ExerciseSet,
)


class ExerciseCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExerciseCategory
        fields = '__all__'


class ExerciseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model  = Exercise
        fields = '__all__'


class ExerciseSetSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ExerciseSet
        fields = '__all__'
        read_only_fields = ('id', 'logged_at')


class WorkoutExerciseSerializer(serializers.ModelSerializer):
    exercise_name    = serializers.CharField(source='exercise.name', read_only=True)
    exercise_details = ExerciseSerializer(source='exercise', read_only=True)
    logged_sets      = ExerciseSetSerializer(many=True, read_only=True)

    class Meta:
        model  = WorkoutExercise
        fields = '__all__'


class WorkoutSessionSerializer(serializers.ModelSerializer):
    exercises    = WorkoutExerciseSerializer(many=True, read_only=True)
    plan_name    = serializers.CharField(source='plan.name', read_only=True)

    class Meta:
        model  = WorkoutSession
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'user')


class WorkoutSessionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WorkoutSession
        fields = ('name', 'plan', 'scheduled_date', 'notes')


class WorkoutPlanSerializer(serializers.ModelSerializer):
    sessions_count = serializers.SerializerMethodField()

    class Meta:
        model  = WorkoutPlan
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'user')

    def get_sessions_count(self, obj):
        return obj.workoutsession_set.count()


class StartWorkoutSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()


class CompleteWorkoutSerializer(serializers.Serializer):
    session_id      = serializers.IntegerField()
    duration_minutes = serializers.IntegerField(required=False)
    calories_burned  = serializers.FloatField(required=False)
    rating           = serializers.IntegerField(min_value=1, max_value=5, required=False)
    notes            = serializers.CharField(required=False, allow_blank=True)
