from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView, RegisterView,
    UserProfileView, ChangePasswordView, WeightLogViewSet,
)

router = DefaultRouter()
router.register(r'weight-log', WeightLogViewSet, basename='weight-log')

urlpatterns = [
    path('login/',           CustomTokenObtainPairView.as_view(), name='login'),
    path('register/',        RegisterView.as_view(),               name='register'),
    path('profile/',         UserProfileView.as_view(),            name='profile'),
    path('change-password/', ChangePasswordView.as_view(),         name='change-password'),
    path('',                 include(router.urls)),
]
