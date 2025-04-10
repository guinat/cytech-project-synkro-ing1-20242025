from django.shortcuts import render
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied


from django_filters.rest_framework import DjangoFilterBackend

User = get_user_model()

from .models import DeviceType, Device, DeviceDataPoint, DeviceCommand, Home, Room, HomeMembership
from .serializers import (
    DeviceTypeSerializer, DeviceSerializer, DeviceDetailSerializer,
    DeviceDataPointSerializer, DeviceCommandSerializer,
    HomeSerializer, HomeDetailSerializer, RoomSerializer, RoomDetailSerializer,
    HomeMembershipSerializer
)
from utils.permissions import (
    DeviceAccessPermission, DeviceDataPermission, DeviceCommandPermission,
    IsAdminUser, IsHomeOwnerOrAdmin, IsHomeMember
)
from utils.mixins import APIResponseMixin, DynamicSerializerMixin
from utils.paginations import StandardResultsPagination
from utils.tokens import TokenGenerator
from utils.api_responses import APIResponse, ErrorCodeEnum
from .email import send_home_invitation_email


class DeviceTypeViewSet(APIResponseMixin, viewsets.ModelViewSet):
    """
    API endpoint for device types.
    Only admin users can create, update or delete device types.
    """
    queryset = DeviceType.objects.all()
    serializer_class = DeviceTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']
    ordering = ['name']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class HomeViewSet(APIResponseMixin, DynamicSerializerMixin, viewsets.ModelViewSet):
    """
    API endpoint for homes (dashboards).
    - Users can create their own homes
    - Users can only see homes they own or are members of
    - Only the owner can update or delete a home
    """
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    serializer_class_mapping = {
        'retrieve': HomeDetailSerializer,
        'me': HomeDetailSerializer,
        'list': HomeSerializer,
        'create': HomeSerializer,
        'update': HomeSerializer,
        'partial_update': HomeSerializer,
    }
    
    def get_queryset(self):
        """Return homes where the user is the owner or a member"""
        user = self.request.user
        # Get homes where user is owner OR member
        return Home.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
    
    def get_permissions(self):
        """Return permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsHomeOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Return the current user's homes"""
        homes = self.get_queryset()
        serializer = self.get_serializer(homes, many=True)
        return self.success_response(data=serializer.data, message="Your homes retrieved successfully")
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to a home"""
        home = self.get_object()
        
        # Only owner can add members
        if request.user != home.owner and request.user.role != 'admin':
            return APIResponse.error(
                message="Only the home owner can add members",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code=ErrorCodeEnum.PERMISSION_DENIED
            )
        
        # Get the email from the request data
        email = request.data.get('email')
        if not email:
            return APIResponse.error(
                message="Email required",
                errors={"email": "This field is required"},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.REQUIRED_FIELD_MISSING
            )
        
        # Create an invitation
        invitation = HomeMembership.objects.create(
            home=home,
            email=email,
            role=request.data.get('role', 'member')
        )
        
        serializer = HomeMembershipSerializer(invitation)
        
        # Send the invitation email
        try:
            send_home_invitation_email(invitation, request)
            
            return APIResponse.success(
                data=serializer.data, 
                message="Invitation created and sent successfully",
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            # Log the error but still create the invitation
            print(f"Error sending invitation email: {str(e)}")
            import traceback
            print(traceback.format_exc())
            
            return APIResponse.success(
                data=serializer.data, 
                message="Invitation created but email sending failed",
                status_code=status.HTTP_201_CREATED,
                metadata={"email_error": True}
            )
    
    @action(detail=False, methods=['get'])
    def my_invitations(self, request):
        """Get all pending invitations for the current user"""
        user_email = request.user.email.lower()
        
        # Get all pending invitations for the user
        invitations = HomeMembership.objects.filter(
            email=user_email,
            is_used=False,
            expires_at__gt=timezone.now()
        )
        
        # Prepare response data with home information
        invitation_data = []
        for invitation in invitations:
            home = invitation.home
            invitation_data.append({
                'invitation_id': invitation.id,
                'home_id': home.id,
                'home_name': home.name,
                'owner_name': home.owner.username,
                'role': invitation.role,
                'expires_at': invitation.expires_at
            })
        
        return APIResponse.success(
            data=invitation_data,
            message="Your invitations retrieved successfully"
        )
    
    @action(detail=False, methods=['post'])
    def accept_invitation(self, request):
        """Accept a specific invitation by ID"""
        invitation_id = request.data.get('invitation_id')
        if not invitation_id:
            return self.error_response(
                message="Invitation ID required",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Check if invitation exists and belongs to user
            invitation = HomeMembership.objects.get(
                id=invitation_id,
                email=request.user.email.lower(),
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            # Add user to home members
            home = invitation.home
            home.members.add(request.user)
            
            # Mark invitation as used
            invitation.is_used = True
            invitation.save()
            
            serializer = self.get_serializer(home)
            return self.success_response(
                data=serializer.data,
                message="You have successfully joined the home"
            )
            
        except HomeMembership.DoesNotExist:
            return self.error_response(
                message="Invitation not found, expired, or already used",
                status_code=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from a home"""
        home = self.get_object()
        
        # Only owner can remove members
        if request.user != home.owner and request.user.role != 'admin':
            return APIResponse.error(
                message="Only the home owner can remove members",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code=ErrorCodeEnum.PERMISSION_DENIED
            )
        
        # Get the user ID from the request data
        user_id = request.data.get('user_id')
        if not user_id:
            return APIResponse.error(
                message="User ID required",
                errors={"user_id": "This field is required"},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.REQUIRED_FIELD_MISSING
            )
        
        # Try to find the member
        try:
            member = home.members.get(id=user_id)
            
            # Can't remove the owner
            if member == home.owner:
                return APIResponse.error(
                    message="Cannot remove the home owner",
                    status_code=status.HTTP_400_BAD_REQUEST,
                    error_code=ErrorCodeEnum.OPERATION_FAILED
                )
            
            # Remove the member
            home.members.remove(member)
            
            return APIResponse.success(
                message=f"{member.username} has been removed from the home",
                status_code=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            return APIResponse.error(
                message="Member not found",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=ErrorCodeEnum.RESOURCE_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def invitations(self, request, pk=None):
        """Get all active invitations for a home"""
        home = self.get_object()
        
        # Only owner can view invitations
        if request.user != home.owner and request.user.role != 'admin':
            return APIResponse.error(
                message="Only the home owner can view invitations",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code=ErrorCodeEnum.PERMISSION_DENIED
            )
        
        invitations = HomeMembership.objects.filter(
            home=home,
            is_used=False,
            expires_at__gt=timezone.now()
        )
        
        serializer = HomeMembershipSerializer(invitations, many=True)
        return APIResponse.success(data=serializer.data)

    @action(detail=False, methods=['post'])
    def join_by_token(self, request):
        """Accept an invitation using a unique token from email"""
        token = request.data.get('token')
        if not token:
            return APIResponse.error(
                message="Invitation token required",
                errors={"token": "This field is required"},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.REQUIRED_FIELD_MISSING
            )
        
        # Verify and decode token
        token_data = TokenGenerator.get_home_invitation_data(token)
        if not token_data:
            return APIResponse.error(
                message="Invalid or expired invitation token",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.TOKEN_INVALID
            )
        
        # Extract token data
        home_id = token_data.get('home_id')
        email = token_data.get('email')
        
        # Check if logged-in user matches token email
        if email.lower() != request.user.email.lower():
            return APIResponse.error(
                message="This invitation is intended for a different email address",
                status_code=status.HTTP_403_FORBIDDEN,
                error_code=ErrorCodeEnum.PERMISSION_DENIED
            )
        
        try:
            # Get the home
            home = Home.objects.get(id=home_id)
            
            # Check if invitation still exists and hasn't been used
            invitation = HomeMembership.objects.filter(
                home=home,
                email=email,
                token=token,
                is_used=False
            ).first()
            
            if not invitation:
                return APIResponse.error(
                    message="Invitation not found or already used",
                    status_code=status.HTTP_404_NOT_FOUND,
                    error_code=ErrorCodeEnum.RESOURCE_NOT_FOUND
                )
            
            # Add user to home members
            home.members.add(request.user)
            
            # Mark invitation as used
            invitation.is_used = True
            invitation.save()
            
            serializer = self.get_serializer(home)
            return APIResponse.success(
                data=serializer.data,
                message="You have successfully joined the home"
            )
            
        except Home.DoesNotExist:
            return APIResponse.error(
                message="Home not found",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=ErrorCodeEnum.RESOURCE_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """This method is replaced by join_by_token and is kept for compatibility"""
        return APIResponse.error(
            message="This method is deprecated. Please use join_by_token instead.",
            status_code=status.HTTP_410_GONE,
            error_code=ErrorCodeEnum.OPERATION_FAILED
        )


class RoomViewSet(APIResponseMixin, DynamicSerializerMixin, viewsets.ModelViewSet):
    """
    API endpoint for rooms.
    - Home members can create rooms
    - Home members can view rooms
    - Only the home owner can update or delete rooms
    """
    permission_classes = [IsAuthenticated, IsHomeMember]
    pagination_class = StandardResultsPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name']
    filterset_fields = ['home']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    serializer_class_mapping = {
        'retrieve': RoomDetailSerializer,
        'list': RoomSerializer,
        'create': RoomSerializer,
        'update': RoomSerializer,
        'partial_update': RoomSerializer,
    }
    
    def get_queryset(self):
        """Return rooms in homes where the user is the owner or a member"""
        user = self.request.user
        
        # Admin can see all rooms
        if user.role == 'admin':
            return Room.objects.all()
            
        # Other users can only see rooms in homes they are a member of
        return Room.objects.filter(
            Q(home__owner=user) | Q(home__members=user)
        ).distinct()
    
    def get_permissions(self):
        """Return permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsHomeOwnerOrAdmin]
        else:
            permission_classes = [IsAuthenticated, IsHomeMember]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def add_device(self, request, pk=None):
        """Add a device to a room"""
        room = self.get_object()
        
        # Get the device ID from the request data
        device_id = request.data.get('device_id')
        if not device_id:
            return APIResponse.error(
                message="Device ID required",
                errors={"device_id": "This field is required"},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.REQUIRED_FIELD_MISSING
            )
        
        # Try to find the device
        try:
            device = Device.objects.get(id=device_id)
            
            # Update the device's room
            device.room = room
            device.save()
            
            serializer = DeviceSerializer(device)
            return APIResponse.success(
                data=serializer.data,
                message="Device successfully added to room",
                status_code=status.HTTP_200_OK
            )
            
        except Device.DoesNotExist:
            return APIResponse.error(
                message="Device not found",
                status_code=status.HTTP_404_NOT_FOUND,
                error_code=ErrorCodeEnum.RESOURCE_NOT_FOUND
            )


class DeviceViewSet(APIResponseMixin, DynamicSerializerMixin, viewsets.ModelViewSet):
    """
    API endpoint for devices.
    - GET: All authenticated users can view devices
    - POST: Only complex users and above can create devices
    - PUT/PATCH: Complex users can update their own devices, admin can update any device
    - DELETE: Only admin users can delete devices
    """
    permission_classes = [DeviceAccessPermission]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['device_type', 'location', 'status', 'manufacturer', 'room', 'home']
    search_fields = ['name', 'location', 'serial_number', 'mac_address']
    ordering_fields = ['name', 'registration_date', 'last_seen']
    ordering = ['-last_seen']
    
    serializer_class_mapping = {
        'retrieve': DeviceDetailSerializer,
        'list': DeviceSerializer,
        'create': DeviceSerializer,
        'update': DeviceSerializer,
        'partial_update': DeviceSerializer,
    }
    
    def get_queryset(self):
        """Return devices accessible to the user"""
        user = self.request.user
        
        # Admin can see all devices
        if user.role == 'admin':
            return Device.objects.all()
            
        # Other users can only see devices in homes they are a member of
        return Device.objects.filter(
            Q(home__owner=user) | Q(home__members=user)
        ).distinct()
    
    @action(detail=True, methods=['post'])
    def send_command(self, request, pk=None):
        """Send a command to a device"""
        device = self.get_object()
        
        # Check if device is online
        if device.status != 'online':
            return APIResponse.error(
                message="Cannot send command because device is offline",
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.DEVICE_OFFLINE
            )
        
        # Get command data
        command_type = request.data.get('command_type')
        params = request.data.get('params', {})
        
        if not command_type:
            return APIResponse.error(
                message="Command type required",
                errors={"command_type": "This field is required"},
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.REQUIRED_FIELD_MISSING
            )
        
        # Create the command
        command = DeviceCommand.objects.create(
            device=device,
            command_type=command_type,
            params=params,
            created_by=request.user
        )
        
        # In a real system, you would now send the command to the device
        # For demo purposes, we'll just mark it as sent
        command.status = 'sent'
        command.sent_at = timezone.now()
        command.save()
        
        serializer = DeviceCommandSerializer(command)
        return APIResponse.success(
            data=serializer.data,
            message="Command sent to device",
            status_code=status.HTTP_201_CREATED
        )


class DeviceDataPointViewSet(APIResponseMixin, viewsets.ModelViewSet):
    """
    API endpoint for device data points.
    - GET: All authenticated users can view data
    - POST: Devices can push data to the server (requires device authentication)
    - PUT/PATCH/DELETE: Only admin users can modify or delete data
    """
    serializer_class = DeviceDataPointSerializer
    permission_classes = [DeviceDataPermission]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['device']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """Return data points for devices accessible to the user"""
        user = self.request.user
        
        # Admin can see all data points
        if user.role == 'admin':
            return DeviceDataPoint.objects.all()
            
        # Other users can only see data points for devices in homes they are a member of
        return DeviceDataPoint.objects.filter(
            Q(device__home__owner=user) | Q(device__home__members=user)
        ).distinct()
    
    def create(self, request, *args, **kwargs):
        """Handle data point creation (used by devices to push data)"""
        # Handle single data point or batch
        is_batch = isinstance(request.data, list)
        
        # If it's batch data, use many=True
        if is_batch:
            serializer = self.get_serializer(data=request.data, many=True)
        else:
            serializer = self.get_serializer(data=request.data)
        
        # Validate the data
        if not serializer.is_valid():
            return APIResponse.error(
                message="Data validation error",
                errors=APIResponse.format_serializer_errors(serializer.errors),
                status_code=status.HTTP_400_BAD_REQUEST,
                error_code=ErrorCodeEnum.VALIDATION_ERROR
            )
        
        try:
            # Save the data
            self.perform_create(serializer)
            
            # Customize response for batch vs. single
            if is_batch:
                count = len(serializer.validated_data)
                message = f"{count} data points have been recorded"
            else:
                message = "Data point recorded"
            
            return APIResponse.success(
                data=serializer.data,
                message=message,
                status_code=status.HTTP_201_CREATED
            )
        except Exception as e:
            # Handle any unexpected errors
            return APIResponse.error(
                message="Error while saving data",
                errors={"detail": str(e)},
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                error_code=ErrorCodeEnum.DATABASE_ERROR
            )


class DeviceCommandViewSet(APIResponseMixin, viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for device commands.
    This is a read-only viewset as commands are created through the device view.
    """
    serializer_class = DeviceCommandSerializer
    permission_classes = [DeviceCommandPermission]
    pagination_class = StandardResultsPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['device', 'status']
    ordering_fields = ['created_at', 'executed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return commands for devices accessible to the user"""
        user = self.request.user
        
        # Admin can see all commands
        if user.role == 'admin':
            return DeviceCommand.objects.all()
            
        # Other users can only see commands for devices in homes they are a member of
        return DeviceCommand.objects.filter(
            Q(device__home__owner=user) | Q(device__home__members=user)
        ).distinct()
