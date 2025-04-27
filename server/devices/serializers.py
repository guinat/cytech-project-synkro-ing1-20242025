from rest_framework import serializers
from .models import Device, DeviceCommand
from .device_catalogue import DEVICE_TYPE_MAP

class DeviceSerializerMixin:
    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Device name must be less than 100 characters.")
        return value

    def validate(self, attrs): #TODO?:
        if getattr(self, 'instance', None) is not None:
            return attrs
        return attrs




class DeviceSerializer(serializers.ModelSerializer):
    capabilities = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Device
        fields = [
            'id', 'name', 'type', 'product_code', 'room', 'state', 'capabilities', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'capabilities']

    def get_capabilities(self, obj):
        return obj.capabilities

    def validate_type(self, value):
        if value not in DEVICE_TYPE_MAP:
            raise serializers.ValidationError('Unknown device type')
        return value

    def validate_state(self, value):
        type_val = self.initial_data.get('type') or (self.instance.type if self.instance else None)
        capabilities = DEVICE_TYPE_MAP.get(type_val, {}).get('capabilities', [])
        if not isinstance(value, dict):
            raise serializers.ValidationError('State must be a JSON object')
        for key in value:
            if key not in capabilities:
                raise serializers.ValidationError(f"'{key}' is not a valid capability for type '{type_val}'")
        return value

    def create(self, validated_data):
        type_val = validated_data['type']
        capabilities = DEVICE_TYPE_MAP.get(type_val, {}).get('capabilities', [])
        state = validated_data.get('state') or {cap: None for cap in capabilities}
        validated_data['state'] = state
        room = self.context['room']
        validated_data['room'] = room
        return super().create(validated_data)




class DeviceCommandSerializer(serializers.ModelSerializer):
    device = serializers.PrimaryKeyRelatedField(read_only=True)
    device_name = serializers.CharField(source='device.name', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DeviceCommand
        fields = [
            'id', 'device', 'device_name', 'capability', 'parameters', 'status',
            'status_display', 'response', 'error_message', 'user', 'user_email',
            'created_at', 'updated_at', 'executed_at'
        ]
        read_only_fields = [
            'id', 'device_name', 'status', 'status_display', 'response',
            'error_message', 'user', 'user_email', 'created_at', 'updated_at', 'executed_at'
        ]

    def validate_capability(self, value):
        device = self.context.get('device')
        if device and value not in device.capabilities:
            raise serializers.ValidationError(f"Capability '{value}' is not supported by this device.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        device = self.context['device']
        validated_data['user'] = user
        validated_data['device'] = device
        validated_data['status'] = DeviceCommand.Status.PENDING
        return super().create(validated_data)

