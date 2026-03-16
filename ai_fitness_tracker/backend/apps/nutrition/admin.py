# apps/nutrition/admin.py
from django.contrib import admin
from .models import FoodItem, NutritionGoal, MealLog, MealLogItem, WaterLog

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display  = ('name', 'brand', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'is_verified')
    list_filter   = ('is_verified',)
    search_fields = ('name', 'brand')

admin.site.register(NutritionGoal)
admin.site.register(MealLog)
admin.site.register(MealLogItem)
admin.site.register(WaterLog)
