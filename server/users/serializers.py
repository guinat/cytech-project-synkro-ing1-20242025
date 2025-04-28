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
            'id', 'email', 'username', 'profile_photo',
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
    role = serializers.CharField(required=False)
    guest_permissions = serializers.DictField(required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['password_confirm', 'points', 'role', 'guest_permissions']

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        # Forcer le rôle à VISITOR pour un invité
        data['role'] = 'VISITOR'
        # Vérifier que les permissions invité sont bien un dict de booléens
        perms = data.get('guest_permissions', {})
        allowed_keys = {'can_view', 'can_control', 'can_add'}
        for key in perms:
            if key not in allowed_keys:
                raise serializers.ValidationError({'guest_permissions': f"Permission inconnue: {key}"})
            if not isinstance(perms[key], bool):
                raise serializers.ValidationError({'guest_permissions': f"La permission {key} doit être un booléen."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm', None)
        # Forcer le rôle à VISITOR pour un invité
        validated_data['role'] = 'VISITOR'
        return super().create(validated_data)


class UserUpdateSerializer(UserSerializerMixin, serializers.ModelSerializer):
    current_password = serializers.CharField(write_only=True, required=False)
    points = serializers.IntegerField(read_only=True)
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['current_password', 'points']
    
    def validate(self, data):
        if 'password' in data and not data.get('current_password'):
            raise serializers.ValidationError({'current_password': 'Current password is required to set a new password.'})
        if 'password' in data and 'current_password' in data:
            user = self.instance
            if not user.check_password(data.get('current_password')):
                raise serializers.ValidationError({'current_password': 'Current password is incorrect.'})
        return data
    
    def update(self, instance, validated_data):
        validated_data.pop('current_password', None)
        return super().update(instance, validated_data)