"""
Workouts App - Views
"""
from django.utils import timezone
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import (
    ExerciseCategory, Exercise, WorkoutPlan,
    WorkoutSession, WorkoutExercise, ExerciseSet,
)
from .serializers import (
    ExerciseCategorySerializer, ExerciseSerializer, WorkoutPlanSerializer,
    WorkoutSessionSerializer, WorkoutSessionCreateSerializer,
    WorkoutExerciseSerializer, ExerciseSetSerializer, CompleteWorkoutSerializer,
)


class ExerciseCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = ExerciseCategory.objects.all()
    serializer_class   = ExerciseCategorySerializer
    permission_classes = [IsAuthenticated]


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Exercise.objects.filter(is_active=True)
    serializer_class   = ExerciseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields   = ['primary_muscle', 'difficulty', 'category']
    search_fields      = ['name', 'equipment']
    ordering_fields    = ['name', 'difficulty']

    @action(detail=False, methods=['get'], url_path='by-muscle/(?P<muscle>[^/.]+)')
    def by_muscle(self, request, muscle=None):
        exercises = self.get_queryset().filter(primary_muscle=muscle)
        serializer = self.get_serializer(exercises, many=True)
        return Response(serializer.data)


class WorkoutPlanViewSet(viewsets.ModelViewSet):
    serializer_class   = WorkoutPlanSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutPlan.objects.filter(user=self.request.user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        plan = self.get_object()
        WorkoutPlan.objects.filter(user=request.user, is_active=True).update(is_active=False)
        plan.is_active = True
        plan.save()
        return Response({'message': f'Plan "{plan.name}" is now active.'})


class WorkoutSessionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields   = ['status', 'scheduled_date']
    ordering_fields    = ['scheduled_date', 'created_at']

    def get_queryset(self):
        return WorkoutSession.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return WorkoutSessionCreateSerializer
        return WorkoutSessionSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        session = self.get_object()
        if session.status == 'completed':
            return Response({'error': 'Session already completed.'}, status=400)
        session.status     = 'in_progress'
        session.started_at = timezone.now()
        session.save()
        return Response(WorkoutSessionSerializer(session).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        session    = self.get_object()
        serializer = CompleteWorkoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session.status       = 'completed'
        session.completed_at = timezone.now()
        if 'duration_minutes' in data:
            session.duration_minutes = data['duration_minutes']
        if 'calories_burned' in data:
            session.calories_burned  = data['calories_burned']
        if 'rating' in data:
            session.rating = data['rating']
        if 'notes' in data:
            session.notes  = data['notes']
        session.save()
        return Response(WorkoutSessionSerializer(session).data)

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        from datetime import date
        sessions = self.get_queryset().filter(scheduled_date=date.today())
        return Response(WorkoutSessionSerializer(sessions, many=True).data)

    @action(detail=False, methods=['get'], url_path='upcoming')
    def upcoming(self, request):
        from datetime import date
        sessions = self.get_queryset().filter(
            scheduled_date__gte=date.today(), status='planned'
        )[:10]
        return Response(WorkoutSessionSerializer(sessions, many=True).data)

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        sessions = self.get_queryset().filter(status='completed')[:20]
        return Response(WorkoutSessionSerializer(sessions, many=True).data)


class WorkoutExerciseViewSet(viewsets.ModelViewSet):
    serializer_class   = WorkoutExerciseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return WorkoutExercise.objects.filter(
            session__user=self.request.user
        )

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        exercise = self.get_object()
        exercise.is_completed = True
        exercise.save()
        return Response({'message': 'Exercise marked as completed.'})


class ExerciseSetViewSet(viewsets.ModelViewSet):
    serializer_class   = ExerciseSetSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseSet.objects.filter(
            workout_exercise__session__user=self.request.user
        )
