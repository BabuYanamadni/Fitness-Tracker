from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIConversationViewSet, NewChatView, GenerateWorkoutPlanView

router = DefaultRouter()
router.register(r'conversations', AIConversationViewSet, basename='ai-conversation')

urlpatterns = [
    path('', include(router.urls)),
    path('chat/',            NewChatView.as_view(),            name='ai-new-chat'),
    path('generate-plan/',   GenerateWorkoutPlanView.as_view(), name='ai-generate-plan'),
]
