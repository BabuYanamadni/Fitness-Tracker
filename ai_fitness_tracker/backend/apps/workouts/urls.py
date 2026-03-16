from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ExerciseCategoryViewSet, ExerciseViewSet, WorkoutPlanViewSet,
    WorkoutSessionViewSet, WorkoutExerciseViewSet, ExerciseSetViewSet,
)

router = DefaultRouter()
router.register(r'categories',        ExerciseCategoryViewSet, basename='exercise-category')
router.register(r'exercises',         ExerciseViewSet,         basename='exercise')
router.register(r'plans',             WorkoutPlanViewSet,      basename='workout-plan')
router.register(r'sessions',          WorkoutSessionViewSet,   basename='workout-session')
router.register(r'session-exercises', WorkoutExerciseViewSet,  basename='workout-exercise')
router.register(r'sets',              ExerciseSetViewSet,      basename='exercise-set')

urlpatterns = [
    path('', include(router.urls)),
]
