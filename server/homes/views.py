from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from utils.tokens import TokenGenerator
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from .models import Home, HomeInvitation
from .serializers import HomeSerializer, HomeDetailSerializer, HomeInvitationSerializer
from utils.responses import ApiResponse
from utils.permissions import IsOwner, IsHomeOwnerOrMember
from utils.exceptions import PermissionDeniedError
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django.contrib.auth import get_user_model


User = get_user_model()

class HomeViewSet(viewsets.ModelViewSet):
    serializer_class = HomeSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['owner']
    search_fields = ['name', 'owner']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        user = self.request.user
        return Home.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.action in ['retrieve', 'me']:
            return HomeDetailSerializer
        return HomeSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOwner()]
        else:
            return [IsHomeOwnerOrMember()]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        home = serializer.save()
        user = request.user
        if user.is_authenticated and hasattr(user, 'points'):
            user.points += 30
            user.save()
        return ApiResponse.success(
            HomeSerializer(home).data,
            message="Home created successfully",
            status_code=status.HTTP_201_CREATED
        )
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        home = serializer.save()
        return ApiResponse.success(
            HomeSerializer(home).data,
            message="Home updated successfully"
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return ApiResponse.success(
            message="Home deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        user = request.user
        homes = Home.objects.filter(owner=user)
        serializer = self.get_serializer(homes, many=True)
        return ApiResponse.success(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        home = self.get_object()
        
        # Check if user is the owner
        if request.user != home.owner:
            raise PermissionDeniedError("Only the home owner can add members.")
        
        user_id = request.data.get('user_id')
        if not user_id:
            return ApiResponse.error("User ID is required.")
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return ApiResponse.error("User not found.")
        
        if user == home.owner:
            return ApiResponse.error("Owner cannot be added as a member.")
        
        if user in home.members.all():
            return ApiResponse.error("User is already a member of this home.")
        
        home.members.add(user)
        home.save()
        
        return ApiResponse.success(
            HomeDetailSerializer(home).data,
            message="Member added successfully"
        )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        home = self.get_object()
        
        # Check if user is the owner
        if request.user != home.owner:
            raise PermissionDeniedError("Only the home owner can remove members.")
        
        user_id = request.data.get('user_id')
        if not user_id:
            return ApiResponse.error("User ID is required.")
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return ApiResponse.error("User not found.")
        
        if user not in home.members.all():
            return ApiResponse.error("User is not a member of this home.")
        
        home.members.remove(user)
        home.save()
        
        return ApiResponse.success(
            HomeDetailSerializer(home).data,
            message="Member removed successfully"
        )

class HomeInvitationViewSet(viewsets.ModelViewSet):

    @action(detail=False, methods=['post'], url_path='accept-by-token', permission_classes=[IsAuthenticated])
    def accept_by_token(self, request):
        token = request.data.get('token')
        if not token:
            return ApiResponse.error("Token is required.", status_code=400)
        data = TokenGenerator.get_home_invitation_data(token)
        if not data:
            return ApiResponse.error("Invalid or expired invitation token.", status_code=400)
        home_id = data.get('home_id')
        email = data.get('email')
        if not home_id or not email:
            return ApiResponse.error("Invalid invitation token payload.", status_code=400)
        try:
            invitation = HomeInvitation.objects.get(home_id=home_id, email=email)
        except HomeInvitation.DoesNotExist:
            return ApiResponse.error("Invitation not found.", status_code=404)
        if invitation.email != request.user.email:
            return ApiResponse.forbidden("You can only accept invitations sent to your email address.")
        if invitation.status != HomeInvitation.Status.PENDING:
            return ApiResponse.error("This invitation has already been processed.", status_code=400)
        if invitation.expires_at < timezone.now():
            invitation.status = HomeInvitation.Status.EXPIRED
            invitation.save()
            return ApiResponse.error("This invitation has expired.", status_code=400)
        # Email check
        if request.user.email != email:
            return ApiResponse.error("You must be logged in with the invited email address to accept this invitation.", status_code=403)
        # Email verification check
        if hasattr(request.user, 'is_email_verified') and not request.user.is_email_verified:
            return ApiResponse.error("You must verify your email address before accepting an invitation.", status_code=403)
        # Add user to home members
        home = invitation.home
        home.members.add(request.user)
        # Update invitation status
        invitation.status = HomeInvitation.Status.ACCEPTED
        invitation.save()
        return ApiResponse.success(message="Invitation accepted successfully")

    @action(detail=False, methods=['post'], url_path='reject-by-token', permission_classes=[IsAuthenticated])
    def reject_by_token(self, request):
        token = request.data.get('token')
        if not token:
            return ApiResponse.error("Token is required.", status_code=400)
        data = TokenGenerator.get_home_invitation_data(token)
        if not data:
            return ApiResponse.error("Invalid or expired invitation token.", status_code=400)
        home_id = data.get('home_id')
        email = data.get('email')
        if not home_id or not email:
            return ApiResponse.error("Invalid invitation token payload.", status_code=400)
        try:
            invitation = HomeInvitation.objects.get(home_id=home_id, email=email)
        except HomeInvitation.DoesNotExist:
            return ApiResponse.error("Invitation not found.", status_code=404)
        if invitation.email != request.user.email:
            return ApiResponse.forbidden("You can only decline invitations sent to your email address.")
        if invitation.status != HomeInvitation.Status.PENDING:
            return ApiResponse.error("This invitation has already been processed.", status_code=400)
        if invitation.expires_at < timezone.now():
            invitation.status = HomeInvitation.Status.EXPIRED
            invitation.save()
            return ApiResponse.error("This invitation has expired.", status_code=400)
        # Email check
        if request.user.email != email:
            return ApiResponse.error("You must be logged in with the invited email address to decline this invitation.", status_code=403)
        # Email verification check
        # if hasattr(request.user, 'is_email_verified') and not request.user.is_email_verified:
        #     return ApiResponse.error("Vous devez vérifier votre adresse email avant de refuser une invitation.", status_code=403)
        # Update invitation status
        invitation.status = HomeInvitation.Status.DECLINED
        invitation.save()
        return ApiResponse.success(message="Invitation declined successfully")

    
    serializer_class = HomeInvitationSerializer
    
    def get_queryset(self):
        home_id = self.kwargs['home_pk']
        home = get_object_or_404(Home, id=home_id)
        
        # Check if user is the owner or a member
        user = self.request.user
        if user != home.owner and user not in home.members.all():
            return HomeInvitation.objects.none()
        
        # Return only pending invitations by default
        return HomeInvitation.objects.filter(home=home, status=HomeInvitation.Status.PENDING)
    
    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            # Owner of the home, not the invitation
            permission_classes = [permissions.IsAuthenticated]
            return [permission() for permission in permission_classes]
        return [IsHomeOwnerOrMember()]
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        home_id = self.kwargs.get('home_pk') or self.kwargs.get('pk')
        context['home'] = get_object_or_404(Home, id=home_id)
        return context
    
    def create(self, request, *args, **kwargs):
        # Get the home
        home_id = self.kwargs['home_pk']
        home = get_object_or_404(Home, id=home_id)
        
        # Check if user is the owner of the home
        if request.user != home.owner:
            raise PermissionDeniedError("Only the home owner can create invitations.")
        
        email = request.data.get('email')
        if not email:
            return ApiResponse.error("Email is required.", status_code=400)
        # Delete any existing invitation for this home/email that is not pending
        existing = HomeInvitation.objects.filter(home=home, email=email).exclude(status=HomeInvitation.Status.PENDING)
        if existing.exists():
            existing.delete()
        # If a pending invitation already exists, error
        if HomeInvitation.objects.filter(home=home, email=email, status=HomeInvitation.Status.PENDING).exists():
            return ApiResponse.error("An invitation is already pending for this user.", status_code=400)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        invitation = serializer.save()
        return ApiResponse.success(
            HomeInvitationSerializer(invitation).data,
            message="Invitation sent successfully",
            status_code=status.HTTP_201_CREATED
        )
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Only the owner can delete invitations
        if request.user != instance.home.owner:
            raise PermissionDeniedError("Only the home owner can delete invitations.")
        # Can delete any invitation, regardless of status
        self.perform_destroy(instance)
        return ApiResponse.success(
            message="Invitation deleted successfully",
            status_code=status.HTTP_204_NO_CONTENT
        )
