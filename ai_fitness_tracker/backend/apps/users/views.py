"""
Users App - Views
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, UserWeightLog
from .serializers import (
    CustomTokenObtainPairSerializer, RegisterSerializer,
    UserProfileSerializer, ChangePasswordSerializer, UserWeightLogSerializer,
)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {'message': 'Account created successfully.', 'user_id': user.id},
            status=status.HTTP_201_CREATED,
        )


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({'message': 'Password updated successfully.'})


class WeightLogViewSet(viewsets.ModelViewSet):
    serializer_class   = UserWeightLogSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserWeightLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        entry = serializer.save(user=self.request.user)
        # Auto-update user's current weight
        self.request.user.weight_kg = entry.weight_kg
        self.request.user.save(update_fields=['weight_kg'])

    @action(detail=False, methods=['get'], url_path='latest')
    def latest(self, request):
        log = self.get_queryset().first()
        if log:
            return Response(UserWeightLogSerializer(log).data)
        return Response({'detail': 'No weight logs found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='progress')
    def progress(self, request):
        """Return last 30 weight entries for chart."""
        logs = self.get_queryset()[:30]
        return Response(UserWeightLogSerializer(logs, many=True).data)
