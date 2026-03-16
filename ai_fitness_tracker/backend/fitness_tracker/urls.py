"""
AI Fitness Tracker Pro - URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT Auth
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App APIs
    path('api/auth/',       include('apps.users.urls')),
    path('api/workouts/',   include('apps.workouts.urls')),
    path('api/nutrition/',  include('apps.nutrition.urls')),
    path('api/ai-coach/',   include('apps.ai_coach.urls')),
    path('api/analytics/',  include('apps.analytics.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
