"""
Nutrition App - Models
"""
from django.db import models
from django.conf import settings


class FoodItem(models.Model):
    """Food database item."""
    name         = models.CharField(max_length=200)
    brand        = models.CharField(max_length=200, blank=True)
    serving_size = models.FloatField(default=100, help_text='Serving size in grams')
    calories     = models.FloatField(help_text='Calories per serving')
    protein_g    = models.FloatField(default=0)
    carbs_g      = models.FloatField(default=0)
    fat_g        = models.FloatField(default=0)
    fiber_g      = models.FloatField(default=0)
    sugar_g      = models.FloatField(default=0)
    sodium_mg    = models.FloatField(default=0)
    is_verified  = models.BooleanField(default=False)
    created_by   = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='created_foods'
    )

    class Meta:
        db_table = 'food_items'

    def __str__(self):
        return f'{self.name} ({self.brand})' if self.brand else self.name


class NutritionGoal(models.Model):
    user           = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='nutrition_goal')
    daily_calories = models.FloatField(default=2000)
    protein_g      = models.FloatField(default=150)
    carbs_g        = models.FloatField(default=250)
    fat_g          = models.FloatField(default=65)
    fiber_g        = models.FloatField(default=25)
    water_ml       = models.FloatField(default=2500)
    updated_at     = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'nutrition_goals'

    def __str__(self):
        return f'{self.user.email} - Nutrition Goal'


class MealLog(models.Model):
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Breakfast'),
        ('lunch',     'Lunch'),
        ('dinner',    'Dinner'),
        ('snack',     'Snack'),
    ]

    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='meal_logs')
    meal_type  = models.CharField(max_length=15, choices=MEAL_TYPE_CHOICES)
    logged_date = models.DateField()
    notes      = models.TextField(blank=True)
    logged_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'meal_logs'
        ordering = ['-logged_date', 'meal_type']

    def __str__(self):
        return f'{self.user.email} - {self.meal_type} on {self.logged_date}'

    @property
    def total_calories(self):
        return sum(item.calories for item in self.items.all())

    @property
    def total_protein(self):
        return sum(item.protein_g for item in self.items.all())


class MealLogItem(models.Model):
    """Individual food item within a meal log."""
    meal       = models.ForeignKey(MealLog, on_delete=models.CASCADE, related_name='items')
    food_item  = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    quantity   = models.FloatField(default=1, help_text='Number of servings')

    class Meta:
        db_table = 'meal_log_items'

    @property
    def calories(self):
        return self.food_item.calories * self.quantity

    @property
    def protein_g(self):
        return self.food_item.protein_g * self.quantity

    @property
    def carbs_g(self):
        return self.food_item.carbs_g * self.quantity

    @property
    def fat_g(self):
        return self.food_item.fat_g * self.quantity


class WaterLog(models.Model):
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='water_logs')
    amount_ml  = models.FloatField(help_text='Amount in millilitres')
    logged_date = models.DateField()
    logged_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'water_logs'
        ordering = ['-logged_at']
