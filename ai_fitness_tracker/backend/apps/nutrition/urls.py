from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FoodItemViewSet, NutritionGoalViewSet, MealLogViewSet,
    MealLogItemViewSet, WaterLogViewSet,
)

router = DefaultRouter()
router.register(r'foods',      FoodItemViewSet,      basename='food')
router.register(r'goals',      NutritionGoalViewSet, basename='nutrition-goal')
router.register(r'meals',      MealLogViewSet,       basename='meal-log')
router.register(r'meal-items', MealLogItemViewSet,   basename='meal-log-item')
router.register(r'water',      WaterLogViewSet,      basename='water-log')

urlpatterns = [path('', include(router.urls))]
