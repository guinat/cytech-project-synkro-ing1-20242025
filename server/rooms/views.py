from rest_framework import viewsets, status
from django.shortcuts import get_object_or_404
from .models import Room
from homes.models import Home
from .serializers import RoomSerializer, RoomDetailSerializer
from utils.responses import ApiResponse
from utils.permissions import IsHomeOwnerOrMember
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from users.models_action_history import ActionHistory


class RoomViewSet(viewsets.ModelViewSet):
    serializer_class = RoomSerializer
    permission_classes = [IsHomeOwnerOrMember]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        home_id = self.kwargs['home_pk']
        return Room.objects.filter(home__id=home_id)
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        home_id = self.kwargs['home_pk']
        if self.action != 'list':
            context['home'] = get_object_or_404(Home, id=home_id)
        else:
            context['home'] = Home.objects.filter(id=home_id).first()
        return context
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            is_valid = serializer.is_valid(raise_exception=False)
            if not is_valid:
                return ApiResponse.error(
                    message="Erreur de validation lors de la création de la pièce.",
                    errors=serializer.errors,
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            room = serializer.save()
            # Historique action utilisateur
            user = request.user if request.user.is_authenticated else None
            ip = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0] or request.META.get('REMOTE_ADDR')
            user_agent = request.META.get('HTTP_USER_AGENT', '')
            if user:
                ActionHistory.objects.create(
                    user=user,
                    action_type="CREATE_ROOM",
                    target_id=str(room.id),
                    target_repr=str(room),
                    ip_address=ip,
                    user_agent=user_agent
                )
            return ApiResponse.success(
                RoomSerializer(room).data,
                message="Room created successfully",
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            return ApiResponse.error(
                {'detail': str(e)},
                message="Erreur serveur lors de la création de la pièce.",
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        room = serializer.save()
        return ApiResponse.success(
            RoomSerializer(room).data,
            message="Room updated successfully"
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return ApiResponse.success(
            message="Room deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
