from rest_framework import serializers
from .models import Room


class RoomSerializer(serializers.ModelSerializer):
    devices_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'name', 'home', 'created_at', 'updated_at', 'devices_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'home']

    def validate_name(self, value):
        home = self.context['home']
        if len(value) > 100:
            raise serializers.ValidationError("Room name must be less than 100 characters.")
        if self.instance and self.instance.name == value:
            return value
        if Room.objects.filter(home=home, name=value).exists():
            raise serializers.ValidationError("A room with this name already exists in the home.")
        return value

    def get_devices_count(self, obj):
        return obj.devices.count() if hasattr(obj, 'devices') else 0

    def create(self, validated_data):
        home = self.context['home']
        validated_data['home'] = home
        return super().create(validated_data)

class RoomDetailSerializer(RoomSerializer):
    class Meta(RoomSerializer.Meta):
        fields = RoomSerializer.Meta.fields


class RoomDetailSerializer(RoomSerializer):
    #TODO?:
    class Meta(RoomSerializer.Meta):
        fields = RoomSerializer.Meta.fields 