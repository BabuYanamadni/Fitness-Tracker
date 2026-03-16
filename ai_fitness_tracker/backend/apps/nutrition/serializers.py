"""
Nutrition App - Serializers
"""
from rest_framework import serializers
from .models import FoodItem, NutritionGoal, MealLog, MealLogItem, WaterLog


class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = FoodItem
        fields = '__all__'
        read_only_fields = ('id', 'is_verified', 'created_by')


class NutritionGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model  = NutritionGoal
        fields = '__all__'
        read_only_fields = ('id', 'user', 'updated_at')


class MealLogItemSerializer(serializers.ModelSerializer):
    food_name = serializers.CharField(source='food_item.name', read_only=True)
    calories  = serializers.ReadOnlyField()
    protein_g = serializers.ReadOnlyField()
    carbs_g   = serializers.ReadOnlyField()
    fat_g     = serializers.ReadOnlyField()

    class Meta:
        model  = MealLogItem
        fields = '__all__'


class MealLogSerializer(serializers.ModelSerializer):
    items          = MealLogItemSerializer(many=True, read_only=True)
    total_calories = serializers.ReadOnlyField()
    total_protein  = serializers.ReadOnlyField()

    class Meta:
        model  = MealLog
        fields = '__all__'
        read_only_fields = ('id', 'user', 'logged_at')


class WaterLogSerializer(serializers.ModelSerializer):
    class Meta:
        model  = WaterLog
        fields = '__all__'
        read_only_fields = ('id', 'user', 'logged_at')


class DailyNutritionSummarySerializer(serializers.Serializer):
    date           = serializers.DateField()
    total_calories = serializers.FloatField()
    total_protein  = serializers.FloatField()
    total_carbs    = serializers.FloatField()
    total_fat      = serializers.FloatField()
    total_water_ml = serializers.FloatField()
    meal_count     = serializers.IntegerField()
