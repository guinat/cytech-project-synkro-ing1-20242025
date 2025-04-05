from django.shortcuts import render
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.exceptions import PermissionDenied

User = get_user_model()

from .models import DeviceType, Device, DeviceDataPoint, DeviceCommand, Home, Room, HomeMembership
from .serializers import (
    DeviceTypeSerializer, DeviceSerializer, DeviceDetailSerializer,
    DeviceDataPointSerializer, DeviceCommandSerializer,
    HomeSerializer, HomeDetailSerializer, RoomSerializer, RoomDetailSerializer,
    HomeMembershipSerializer
)
from .permissions import (
    DeviceAccessPermission, DeviceDataPermission, DeviceCommandPermission,
    IsAdminUser, IsHomeOwnerOrAdmin, IsHomeMember
)


class StandardResultsSetPagination(PageNumberPagination):
    """Standard pagination for all viewsets"""
    page_size = 25
    page_size_query_param = 'page_size'
    max_page_size = 100


class DeviceTypeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for device types.
    Only admin users can create, update or delete device types.
    """
    queryset = DeviceType.objects.all()
    serializer_class = DeviceTypeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
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


class HomeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for homes (dashboards).
    - Users can create their own homes
    - Users can only see homes they own or are members of
    - Only the owner can update or delete a home
    """
    serializer_class = HomeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Return homes where the user is the owner or a member"""
        user = self.request.user
        # Get homes where user is owner OR member
        return Home.objects.filter(
            Q(owner=user) | Q(members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve' or self.action == 'me':
            return HomeDetailSerializer
        return HomeSerializer
    
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
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to a home"""
        home = self.get_object()
        
        # Only owner can add members
        if request.user != home.owner and request.user.role != 'admin':
            raise PermissionDenied("Only the home owner can add members")
        
        # Get the email from the request data
        email = request.data.get('email')
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create an invitation
        invitation = HomeMembership.objects.create(
            home=home,
            email=email,
            role=request.data.get('role', 'member')
        )
        
        serializer = HomeMembershipSerializer(invitation)
        
        # Here you would typically send an email with the invitation code
        # For simplicity, we'll just return the invitation details
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """Join a home using an invitation code"""
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'Invitation code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Try to find an invitation with the given code
            invitation = HomeMembership.objects.get(code=code, is_used=False)
            
            # Check if invitation has expired
            if invitation.expires_at < timezone.now():
                return Response(
                    {'error': 'Invitation has expired'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if the user's email matches the invitation email
            if request.user.email.lower() != invitation.email.lower():
                return Response(
                    {'error': 'This invitation is for a different email address'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Add the user to the home's members
            home = invitation.home
            home.members.add(request.user)
            
            # Mark the invitation as used
            invitation.is_used = True
            invitation.save()
            
            serializer = self.get_serializer(home)
            return Response(serializer.data)
            
        except HomeMembership.DoesNotExist:
            return Response(
                {'error': 'Invalid invitation code'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Remove a member from a home"""
        home = self.get_object()
        
        # Only owner can remove members
        if request.user != home.owner and request.user.role != 'admin':
            raise PermissionDenied("Only the home owner can remove members")
        
        # Get the user ID from the request data
        user_id = request.data.get('user_id')
        if not user_id:
            return Response(
                {'error': 'User ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find the member
        try:
            member = home.members.get(id=user_id)
            home.members.remove(member)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            return Response(
                {'error': 'User is not a member of this home'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['get'])
    def invitations(self, request, pk=None):
        """Get all pending invitations for a home"""
        home = self.get_object()
        
        # Only owner can view invitations
        if request.user != home.owner and request.user.role != 'admin':
            raise PermissionDenied("Only the home owner can view invitations")
        
        invitations = HomeMembership.objects.filter(
            home=home,
            is_used=False,
            expires_at__gt=timezone.now()
        )
        serializer = HomeMembershipSerializer(invitations, many=True)
        return Response(serializer.data)


class RoomViewSet(viewsets.ModelViewSet):
    """
    API endpoint for rooms.
    - Home members can create rooms
    - Home members can view rooms
    - Only the home owner can update or delete rooms
    """
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated, IsHomeMember]
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name']
    filterset_fields = ['home']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_queryset(self):
        """Return rooms in homes where the user is the owner or a member"""
        user = self.request.user
        # Get rooms in homes where user is owner OR member
        return Room.objects.filter(
            Q(home__owner=user) | Q(home__members=user)
        ).distinct()
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return RoomDetailSerializer
        return RoomSerializer
    
    def get_permissions(self):
        """Return permissions based on action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsHomeOwnerOrAdmin]
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
            return Response(
                {'error': 'Device ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Try to find the device
        try:
            device = Device.objects.get(id=device_id, owner=request.user)
            device.room = room
            device.home = room.home
            device.save()
            serializer = DeviceSerializer(device)
            return Response(serializer.data)
        except Device.DoesNotExist:
            return Response(
                {'error': 'Device not found or you do not have permission to add it'},
                status=status.HTTP_400_BAD_REQUEST
            )


class DeviceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for devices.
    - GET: All authenticated users can view devices
    - POST: Only complex users and above can create devices
    - PUT/PATCH: Complex users can update their own devices, admin can update any device
    - DELETE: Only admin users can delete devices
    """
    queryset = Device.objects.all()
    serializer_class = DeviceSerializer
    permission_classes = [DeviceAccessPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['device_type', 'location', 'status', 'manufacturer', 'room', 'home']
    search_fields = ['name', 'location', 'serial_number', 'mac_address']
    ordering_fields = ['name', 'registration_date', 'last_seen']
    ordering = ['-last_seen']
    
    def get_queryset(self):
        """Filter devices based on user's role"""
        user = self.request.user
        # Admin can see all devices
        if user.role == 'admin':
            return Device.objects.all()
        # Regular users can only see their own devices
        return Device.objects.filter(owner=user)
    
    def get_serializer_class(self):
        """Return different serializers for list and detail views"""
        if self.action == 'retrieve':
            return DeviceDetailSerializer
        return DeviceSerializer
    
    @action(detail=True, methods=['post'])
    def send_command(self, request, pk=None):
        """
        Send a command to a device
        """
        device = self.get_object()
        
        # Ensure the command data is provided
        if not request.data.get('command'):
            return Response(
                {'error': 'Command data is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create a new command for this device
        command_data = {
            'device': device.pk,
            'command': request.data.get('command'),
            'created_by': request.user.pk
        }
        
        serializer = DeviceCommandSerializer(
            data=command_data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            command = serializer.save(status='pending')
            
            # In a real-world application, here you would trigger the actual
            # sending of the command to the physical device, potentially using
            # a task queue like Celery.
            
            # For the demo, we'll just update the command to "sent" status
            command.status = 'sent'
            command.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeviceDataPointViewSet(viewsets.ModelViewSet):
    """
    API endpoint for device data points.
    - GET: All authenticated users can view data
    - POST: Devices can push data to the server (requires device authentication)
    - PUT/PATCH/DELETE: Only admin users can modify or delete data
    """
    queryset = DeviceDataPoint.objects.all()
    serializer_class = DeviceDataPointSerializer
    permission_classes = [DeviceDataPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['device']
    ordering_fields = ['timestamp']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        """
        Filter data points based on device and optional time range
        """
        queryset = DeviceDataPoint.objects.all()
        
        # Filter by device if specified
        device_id = self.request.query_params.get('device', None)
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        
        # Filter by user's owned devices if not admin
        user = self.request.user
        if user.role != 'admin':
            queryset = queryset.filter(device__owner=user)
        
        # Filter by time range if specified
        start_time = self.request.query_params.get('start_time', None)
        end_time = self.request.query_params.get('end_time', None)
        
        if start_time:
            queryset = queryset.filter(timestamp__gte=start_time)
        if end_time:
            queryset = queryset.filter(timestamp__lte=end_time)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """
        Create a new data point for a device.
        Updates the device's last_seen timestamp.
        """
        device_id = request.data.get('device')
        if not device_id:
            return Response(
                {'error': 'Device ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            device = Device.objects.get(pk=device_id)
            
            # In a real-world scenario, you would authenticate the device here
            # by checking an API key or other credentials
            
            # Update the device's last_seen timestamp
            device.last_seen = timezone.now()
            device.status = 'online'
            device.save(update_fields=['last_seen', 'status'])
            
            return super().create(request, *args, **kwargs)
            
        except Device.DoesNotExist:
            return Response(
                {'error': 'Device not found'},
                status=status.HTTP_404_NOT_FOUND
            )


class DeviceCommandViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for device commands.
    This is a read-only viewset as commands are created through the device view.
    """
    queryset = DeviceCommand.objects.all()
    serializer_class = DeviceCommandSerializer
    permission_classes = [DeviceCommandPermission]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['device', 'status']
    ordering_fields = ['created_at', 'executed_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Filter commands based on user's role"""
        user = self.request.user
        # Admin can see all commands
        if user.role == 'admin':
            return DeviceCommand.objects.all()
        # Regular users can only see commands for their own devices
        return DeviceCommand.objects.filter(device__owner=user)
