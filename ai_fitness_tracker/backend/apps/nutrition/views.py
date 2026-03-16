"""
Nutrition App - Views
"""
from datetime import date
from django.db.models import Sum
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import FoodItem, NutritionGoal, MealLog, MealLogItem, WaterLog
from .serializers import (
    FoodItemSerializer, NutritionGoalSerializer, MealLogSerializer,
    MealLogItemSerializer, WaterLogSerializer, DailyNutritionSummarySerializer,
)


class FoodItemViewSet(viewsets.ModelViewSet):
    serializer_class   = FoodItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [filters.SearchFilter, DjangoFilterBackend]
    search_fields      = ['name', 'brand']

    def get_queryset(self):
        return FoodItem.objects.filter(is_verified=True) | FoodItem.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class NutritionGoalViewSet(viewsets.ModelViewSet):
    serializer_class   = NutritionGoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return NutritionGoal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def my_goal(self, request):
        goal, _ = NutritionGoal.objects.get_or_create(user=request.user)
        if request.method == 'GET':
            return Response(NutritionGoalSerializer(goal).data)
        serializer = NutritionGoalSerializer(goal, data=request.data, partial=request.method == 'PATCH')
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class MealLogViewSet(viewsets.ModelViewSet):
    serializer_class   = MealLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['logged_date', 'meal_type']

    def get_queryset(self):
        return MealLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='today')
    def today(self, request):
        meals = self.get_queryset().filter(logged_date=date.today())
        return Response(MealLogSerializer(meals, many=True).data)

    @action(detail=False, methods=['get'], url_path='daily-summary')
    def daily_summary(self, request):
        query_date = request.query_params.get('date', str(date.today()))
        meals      = self.get_queryset().filter(logged_date=query_date)
        total_cals = sum(m.total_calories for m in meals)
        total_prot = sum(m.total_protein for m in meals)
        total_carbs = sum(
            sum(i.carbs_g for i in m.items.all()) for m in meals
        )
        total_fat = sum(
            sum(i.fat_g for i in m.items.all()) for m in meals
        )
        water = WaterLog.objects.filter(
            user=request.user, logged_date=query_date
        ).aggregate(total=Sum('amount_ml'))['total'] or 0

        data = {
            'date':           query_date,
            'total_calories': total_cals,
            'total_protein':  total_prot,
            'total_carbs':    total_carbs,
            'total_fat':      total_fat,
            'total_water_ml': water,
            'meal_count':     meals.count(),
        }
        return Response(DailyNutritionSummarySerializer(data).data)


class MealLogItemViewSet(viewsets.ModelViewSet):
    serializer_class   = MealLogItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MealLogItem.objects.filter(meal__user=self.request.user)


class WaterLogViewSet(viewsets.ModelViewSet):
    serializer_class   = WaterLogSerializer
    permission_classes = [IsAuthenticated]
    filter_backends    = [DjangoFilterBackend]
    filterset_fields   = ['logged_date']

    def get_queryset(self):
        return WaterLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='today-total')
    def today_total(self, request):
        total = self.get_queryset().filter(logged_date=date.today()).aggregate(
            total=Sum('amount_ml')
        )['total'] or 0
        return Response({'date': str(date.today()), 'total_ml': total})
