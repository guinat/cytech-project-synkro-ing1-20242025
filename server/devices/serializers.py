from rest_framework import serializers
from .models import DeviceType, Device, DeviceDataPoint, DeviceCommand, Home, Room, HomeMembership
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class DeviceTypeSerializer(serializers.ModelSerializer):
    """Serializer for DeviceType model"""
    
    class Meta:
        model = DeviceType
        fields = ['id', 'name', 'description']


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for User model, used in Home serializer"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class DeviceSerializer(serializers.ModelSerializer):
    """Serializer for Device model with basic information"""
    device_type_name = serializers.CharField(source='device_type.name', read_only=True)
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True)
    home_name = serializers.CharField(source='home.name', read_only=True)
    
    class Meta:
        model = Device
        fields = [
            'id', 'name', 'device_type', 'device_type_name', 'location', 
            'status', 'owner', 'owner_username', 'room', 'room_name', 
            'home', 'home_name', 'registration_date', 'last_seen',
            'manufacturer', 'model', 'serial_number', 'mac_address', 'firmware_version'
        ]
        read_only_fields = ['registration_date', 'last_seen', 'owner']
        extra_kwargs = {
            'api_key': {'write_only': True},
            'room': {'required': True},
        }
    
    def validate_name(self, value):
        """Validate device name"""
        if len(value) < 2:
            raise serializers.ValidationError("Device name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Device name cannot exceed 100 characters.")
        return value
    
    def validate_mac_address(self, value):
        """Validate MAC address format if provided"""
        if value:
            # Check if the MAC address already exists for a different device
            user_id = self.instance.id if self.instance else None
            if Device.objects.filter(mac_address=value).exclude(id=user_id).exists():
                raise serializers.ValidationError("This MAC address is already used by another device.")
            
            # Validate MAC address format (XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
            import re
            if not re.match(r'^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$', value):
                raise serializers.ValidationError("Invalid MAC address format. Use format XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX.")
        return value
    
    def validate_serial_number(self, value):
        """Validate serial number if provided"""
        if value:
            # Check if the serial number already exists for a different device
            user_id = self.instance.id if self.instance else None
            if Device.objects.filter(serial_number=value).exclude(id=user_id).exists():
                raise serializers.ValidationError("This serial number is already used by another device.")
        return value
    
    def validate_location(self, value):
        """Validate location"""
        if value and len(value) > 100:
            raise serializers.ValidationError("Location cannot exceed 100 characters.")
        return value
    
    def validate(self, data):
        """Validate that room is provided"""
        if 'room' not in data:
            raise serializers.ValidationError({"room": "A room must be specified for the device."})
        
        # If room is provided, ensure home is consistent with the room's home
        if 'room' in data and 'home' in data and data['room'].home != data['home']:
            raise serializers.ValidationError({"home": "The specified home does not match the home of the selected room."})
        
        return data
    
    def create(self, validated_data):
        # Set the owner to the current user
        user = self.context['request'].user
        validated_data['owner'] = user
        
        # If home is not provided but room is, derive home from room
        if 'room' in validated_data and 'home' not in validated_data:
            validated_data['home'] = validated_data['room'].home
            
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""
    device_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'home', 'created_at', 'device_count']
        read_only_fields = ['created_at']
    
    def validate_name(self, value):
        """Validate room name"""
        if len(value) < 2:
            raise serializers.ValidationError("Room name must be at least 2 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Room name cannot exceed 100 characters.")
        return value
    
    def validate(self, data):
        """Validate room data"""
        # Check if a room with the same name already exists in the same home
        if self.instance:  # Update operation
            if Room.objects.filter(name=data.get('name'), home=data.get('home', self.instance.home)).exclude(id=self.instance.id).exists():
                raise serializers.ValidationError({"name": "A room with this name already exists in this home."})
        else:  # Create operation
            if Room.objects.filter(name=data.get('name'), home=data.get('home')).exists():
                raise serializers.ValidationError({"name": "A room with this name already exists in this home."})
        return data
    
    def get_device_count(self, obj):
        return obj.devices.count()


class RoomDetailSerializer(RoomSerializer):
    """Detailed serializer for Room including devices"""
    devices = DeviceSerializer(many=True, read_only=True)
    
    class Meta(RoomSerializer.Meta):
        fields = RoomSerializer.Meta.fields + ['devices']


class HomeSerializer(serializers.ModelSerializer):
    """Serializer for Home model"""
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    member_count = serializers.SerializerMethodField()
    room_count = serializers.SerializerMethodField()
    device_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Home
        fields = ['id', 'name', 'code', 'owner', 'owner_username', 'created_at', 'updated_at', 
                  'member_count', 'room_count', 'device_count']
        read_only_fields = ['code', 'created_at', 'updated_at', 'owner']
    
    def validate_name(self, value):
        """Validate home name"""
        if len(value) < 3:
            raise serializers.ValidationError("Home name must be at least 3 characters long.")
        if len(value) > 100:
            raise serializers.ValidationError("Home name cannot exceed 100 characters.")
        return value
    
    def validate(self, data):
        """Validate home data"""
        # For create operation, check if user is not exceeding maximum homes limit
        user = self.context['request'].user
        if not self.instance and Home.objects.filter(owner=user).count() >= 3:
            raise serializers.ValidationError({"non_field_errors": "You cannot create more than 3 homes."})
        return data
    
    def get_member_count(self, obj):
        return obj.members.count() + 1  # Include owner
    
    def get_room_count(self, obj):
        return obj.rooms.count()
    
    def get_device_count(self, obj):
        return obj.devices.count()
    
    def create(self, validated_data):
        # Set the owner to the current user
        user = self.context['request'].user
        validated_data['owner'] = user
        return super().create(validated_data)


class HomeDetailSerializer(HomeSerializer):
    """Detailed serializer for Home including rooms and members"""
    rooms = RoomSerializer(many=True, read_only=True)
    owner = UserBasicSerializer(read_only=True)
    members = UserBasicSerializer(many=True, read_only=True)
    
    class Meta(HomeSerializer.Meta):
        fields = HomeSerializer.Meta.fields + ['rooms', 'members']


class HomeMembershipSerializer(serializers.ModelSerializer):
    """Serializer for HomeMembership model (invitations)"""
    home_name = serializers.CharField(source='home.name', read_only=True)
    inviter_username = serializers.CharField(source='home.owner.username', read_only=True)
    
    class Meta:
        model = HomeMembership
        fields = ['id', 'home', 'home_name', 'email', 'code', 'role', 
                  'created_at', 'expires_at', 'is_used', 'inviter_username']
        read_only_fields = ['code', 'created_at', 'expires_at', 'is_used']
    
    def validate_email(self, value):
        """Validate invitation email"""
        # Check email format (basic validation already done by EmailField)
        
        # Check if email already has a pending invitation for this home
        home = self.initial_data.get('home')
        if home and HomeMembership.objects.filter(home=home, email=value, is_used=False, expires_at__gt=timezone.now()).exists():
            raise serializers.ValidationError("An invitation is already pending for this email in this home.")
        
        # Check if email is already a member of the home
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user_with_email = User.objects.filter(email=value).first()
        if user_with_email:
            if home:
                home_obj = Home.objects.get(id=home)
                if home_obj.owner == user_with_email or home_obj.members.filter(id=user_with_email.id).exists():
                    raise serializers.ValidationError("This person is already a member of this home.")
        
        return value
    
    def validate_role(self, value):
        """Validate user role in home"""
        valid_roles = ['adult', 'child', 'guest', 'other']
        if value not in valid_roles:
            raise serializers.ValidationError(f"Role must be one of: {', '.join(valid_roles)}")
        return value
    
    def validate(self, data):
        """Validate invitation data"""
        # Check if the user has reached the invitation limit for this home
        home = data.get('home')
        if home:
            active_invitations = HomeMembership.objects.filter(
                home=home, 
                is_used=False, 
                expires_at__gt=timezone.now()
            ).count()
            
            # Limit active invitations to 10 per home
            if active_invitations >= 10:
                raise serializers.ValidationError(
                    {"non_field_errors": "You have reached the limit of 10 active invitations for this home."}
                )
                
            # Check if user is authorized to send invitations
            user = self.context['request'].user
            if home.owner != user:
                raise serializers.ValidationError(
                    {"home": "You are not authorized to send invitations for this home."}
                )
        
        return data


class DeviceDetailSerializer(DeviceSerializer):
    """Serializer for detailed Device information"""
    device_type = DeviceTypeSerializer(read_only=True)
    
    class Meta(DeviceSerializer.Meta):
        fields = DeviceSerializer.Meta.fields + ['api_key']


class DeviceDataPointSerializer(serializers.ModelSerializer):
    """Serializer for DeviceDataPoint model"""
    device_name = serializers.CharField(source='device.name', read_only=True)
    
    class Meta:
        model = DeviceDataPoint
        fields = ['id', 'device', 'device_name', 'timestamp', 'data']
        read_only_fields = ['timestamp']


class DeviceCommandSerializer(serializers.ModelSerializer):
    """Serializer for DeviceCommand model"""
    device_name = serializers.CharField(source='device.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = DeviceCommand
        fields = [
            'id', 'device', 'device_name', 'command', 'status', 
            'created_at', 'updated_at', 'executed_at', 'result',
            'created_by', 'created_by_username'
        ]
        read_only_fields = ['created_at', 'updated_at', 'executed_at', 'result', 'status', 'created_by']
    
    def create(self, validated_data):
        # Set the created_by to the current user
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data) 