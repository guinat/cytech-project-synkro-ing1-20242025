from rest_framework import serializers
from django.contrib.auth import get_user_model
from utils.validators import validate_password


User = get_user_model()


import base64

class UserSerializerMixin:
    def validate_role(self, value):
        roles = [choice[0] for choice in User.ROLES]
        if value not in roles:
            raise serializers.ValidationError(f"Role must be one of: {roles}")
        return value

    def validate_level(self, value):
        levels = [choice[0] for choice in User.LEVELS]
        if value not in levels:
            raise serializers.ValidationError(f"Level must be one of: {levels}")
        return value

    def validate_profile_photo(self, value):
        if value:
            try:
                decoded = base64.b64decode(value)
                if len(decoded) > 10_000:
                    raise serializers.ValidationError('Profile photo must be less than 10kB.')
            except Exception:
                raise serializers.ValidationError('Profile photo must be a valid base64 string.')
        return value

    def validate_password(self, value):
        validation = validate_password(value)
        if not validation['valid']:
            raise serializers.ValidationError(validation['errors'])
        return value

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user



class UserSerializer(UserSerializerMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    profile_photo = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Base64 encoded profile photo")
    points = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'profile_photo', 'display_name', 'guest_detail',
            'is_email_verified', 'role', 'level', 'points', 'date_joined', 'last_login',
            'password'
        ]
        read_only_fields = ['id', 'date_joined', 'last_login', 'is_email_verified', 'points']


class UserMeSerializer(UserSerializer):
    owned_homes_count = serializers.SerializerMethodField()
    member_homes_count = serializers.SerializerMethodField()
    points = serializers.IntegerField(read_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['owned_homes_count', 'member_homes_count', 'points']
    
    def get_owned_homes_count(self, obj):
        return obj.owned_homes.count()
    
    def get_member_homes_count(self, obj):
        return obj.member_homes.count()


class UserCreateSerializer(UserSerializerMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    points = serializers.IntegerField(read_only=True)
    guest_permissions = serializers.DictField(required=False, help_text="Permissions personnalisées pour l'invité", default=dict)

    class Meta:
        model = User
        fields = UserSerializer.Meta.fields + ['password_confirm', 'points', 'guest_permissions', 'display_name', 'guest_detail']

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': "Passwords don't match."})
        # Si guest_permissions fourni, on force le rôle à INVITE
        if data.get('guest_permissions') is not None:
            data['role'] = 'INVITE'
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        # Si guest_permissions fourni, on force le rôle à INVITE
        if 'guest_permissions' in validated_data:
            validated_data['role'] = 'INVITE'
        return super().create(validated_data)


class UserUpdateSerializer(UserSerializerMixin, serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False)
    points = serializers.IntegerField(read_only=True)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['current_password', 'points', 'display_name', 'guest_detail']

    def validate(self, data):
        request = self.context.get('request')
        user = request.user if request else None
        # Prevent non-admins from changing role or guest_permissions
        if user and not user.is_superuser and user.role != 'ADMIN':
            if 'role' in data and data['role'] != self.instance.role:
                raise serializers.ValidationError({'role': 'Only admins can change user roles.'})
            if 'guest_permissions' in data and data['guest_permissions'] != getattr(self.instance, 'guest_permissions', {}):
                raise serializers.ValidationError({'guest_permissions': 'Only admins can change guest permissions.'})
        # If changing password, require current password
        if 'password' in data and self.instance:
            current_password = data.get('current_password')
            if not current_password or not self.instance.check_password(current_password):
                raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return data

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user