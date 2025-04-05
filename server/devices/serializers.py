from rest_framework import serializers
from .models import DeviceType, Device, DeviceDataPoint, DeviceCommand, Home, Room, HomeMembership
from django.contrib.auth import get_user_model

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
    
    def validate(self, data):
        """Validate that room is provided"""
        if 'room' not in data:
            raise serializers.ValidationError({"room": "Une pièce doit être spécifiée pour l'appareil."})
        return data
    
    def create(self, validated_data):
        # Set the owner to the current user
        user = self.context['request'].user
        validated_data['owner'] = user
        return super().create(validated_data)


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model"""
    device_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Room
        fields = ['id', 'name', 'home', 'created_at', 'device_count']
        read_only_fields = ['created_at']
    
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