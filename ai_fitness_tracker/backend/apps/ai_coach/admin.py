# apps/ai_coach/admin.py
from django.contrib import admin
from .models import AIConversation, AIMessage, AIWorkoutPlanRequest

@admin.register(AIConversation)
class AIConversationAdmin(admin.ModelAdmin):
    list_display  = ('user', 'title', 'created_at', 'updated_at')
    search_fields = ('user__email', 'title')

admin.site.register(AIMessage)
admin.site.register(AIWorkoutPlanRequest)
