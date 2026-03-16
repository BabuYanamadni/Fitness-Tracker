# apps/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, UserWeightLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display  = ('email', 'username', 'fitness_goal', 'fitness_level', 'is_active')
    list_filter   = ('fitness_goal', 'fitness_level', 'is_active')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering      = ('-date_joined',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Fitness Profile', {'fields': ('date_of_birth', 'gender', 'height_cm', 'weight_kg', 'fitness_goal', 'fitness_level', 'bio')}),
    )


@admin.register(UserWeightLog)
class UserWeightLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'weight_kg', 'logged_at')
    list_filter  = ('logged_at',)
