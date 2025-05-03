from rest_framework import serializers
from .models import Device, DeviceCommand, DeviceConsumptionHistory
from .device_catalogue import DEVICE_TYPE_MAP

class DeviceSerializerMixin:
    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Device name must be less than 100 characters.")
        return value

    def validate(self, attrs):
        if getattr(self, 'instance', None) is not None:
            return attrs
        return attrs

class DeviceSerializer(serializers.ModelSerializer):
    capabilities = serializers.SerializerMethodField(read_only=True)
    energyConsumption = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Device
        fields = [
            'id', 'name', 'type', 'product_code', 'brand', 'room', 'state', 'capabilities', 'created_at', 'updated_at', 'energyConsumption'  # <<< AJOUT brand ici
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'capabilities', 'energyConsumption']

    def get_energyConsumption(self, obj):
        # Logique identique à EnergyConsumptionView dans views.py
        from .views import DEVICE_TYPE_POWER
        device_state = obj.state or {}
        type_ = getattr(obj, 'type', None)
        power_kw = DEVICE_TYPE_POWER.get(type_, 0)

        # Gestion de l'état ON/OFF (toujours 0 si off)
        on_off = device_state.get('on_off', None)
        power = device_state.get('power', None)
        if (on_off in [None, False, 0, 'off', 'Off', 'OFF', 'false', 'False', 'FALSE']) or (power is not None and power != 'on'):
            return 0.0

        # smart_bulb_x : brightness
        if type_ == 'smart_bulb_x':
            brightness = device_state.get('brightness', 100)
            if brightness is not None and isinstance(brightness, (int, float)):
                power_kw *= (brightness / 100)
            else:
                power_kw *= 1
        # smart_thermostat_x : temperature
        elif type_ == 'smart_thermostat_x':
            temperature = device_state.get('temperature', 100)
            if temperature is not None and isinstance(temperature, (int, float)):
                distance = abs(temperature - 50)
                power_kw *= 0.2 + (distance / 50) * (1 - 0.2)
            else:
                power_kw *= 1
        # dish_washer : temperature, cycle
        elif type_ == 'dish_washer':
            temperature = device_state.get('temperature', 100)
            cycle = device_state.get('cycle_selection', 'Normal')
            if cycle == 'Normal':
                coef = 1
            elif cycle == 'Eco':
                coef = 0.9
            elif cycle == 'Quick':
                coef = 1.2
            else:
                coef = 1
            if temperature is not None and isinstance(temperature, (int, float)):
                power_kw *= coef * ((50 + temperature) / 150)
            else:
                power_kw *= coef
        # washing_machine : temperature, spin_speed_control, cycle
        elif type_ == 'washing_machine':
            temperature = device_state.get('temperature', 100)
            spin_speed_control = device_state.get('spin_speed_control', 2000)
            cycle = device_state.get('cycle_selection', 'Normal')
            if cycle == 'Normal':
                coef = 1
            elif cycle == 'Eco':
                coef = 0.9
            elif cycle == 'Quick':
                coef = 1.2
            else:
                coef = 1
            if temperature is not None and isinstance(temperature, (int, float)):
                power_kw *= coef * ((50 + temperature) / 150) * (spin_speed_control / 2000)
            else:
                power_kw *= coef
        # smart_oven_x : heat
        elif type_ == 'smart_oven_x':
            heat = device_state.get('heat', 0)
            if heat is not None and isinstance(heat, (int, float)) and 50 <= heat <= 250:
                power_kw *= (heat / 250)
            else:
                power_kw = 0.0
        # smart_fridge_x : mode, on_off, power
        elif type_ == 'smart_fridge_x':
            mode = device_state.get('mode', 'normal')
            on_off = device_state.get('on_off', True)
            power = device_state.get('power', 'on')
            if (on_off is not None and on_off) or (power is not None and power == 'on'):
                if mode == 'eco':
                    power_kw = 0.15
                else:
                    power_kw = 0.25
            else:
                power_kw = 0.0

        return round(power_kw, 5)


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

class DeviceConsumptionHistorySerializer(serializers.ModelSerializer):
    device_name = serializers.CharField(source='device.name', read_only=True)

    class Meta:
        model = DeviceConsumptionHistory
        fields = ['id', 'device', 'device_name', 'timestamp', 'consumption']
        read_only_fields = ['id', 'device_name']


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
