from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from utils.validators import validate_password as validate_pwd, validate_email

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    profile_photo = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Base64 encoded profile photo")
    role = serializers.ChoiceField(choices=User.ROLES, required=False, default='VISITOR')
    level = serializers.ChoiceField(choices=User.LEVELS, required=False, default='BEGINNER')

    def validate_email(self, value):
        if not validate_email(value):
            raise serializers.ValidationError("Invalid email format.")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email already exists.")
        return value

    def validate_password(self, value):
        validation = validate_pwd(value)
        if not validation['valid']:
            raise serializers.ValidationError(validation['errors'])
        return value

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        if User.objects.filter(username=data.get('username')).exists():
            raise serializers.ValidationError({'username': 'User with this username already exists.'})
        return data

    def create(self, validated_data):
        email = validated_data['email']
        username = validated_data['username']
        password = validated_data['password']
        profile_photo = validated_data.get('profile_photo', None)
        role = validated_data.get('role', 'VISITOR')
        level = validated_data.get('level', 'BEGINNER')
        user = User.objects.create_user(
            email=email,
            username=username,
            password=password,
            role=role,
            level=level
        )
        if profile_photo:
            user.profile_photo = profile_photo  # base64 string
            user.save()
        return user


class LoginSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        user = authenticate(request=self.context.get('request'), email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        data['user'] = user
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    
    def validate_email(self, value):
        if not User.objects.filter(email=value).exists():
            pass
        return value


class PasswordResetConfirmSerializer(serializers.Serializer):
    
    token = serializers.CharField()
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    def validate_password(self, value):
        validation = validate_pwd(value)
        if not validation['valid']:
            raise serializers.ValidationError(validation['errors'])
        return value
    
    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Passwords do not match.'})
        return data


class PasswordChangeSerializer(serializers.Serializer):
    
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_current_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate_new_password(self, value):
        validation = validate_pwd(value)
        if not validation['valid']:
            raise serializers.ValidationError(validation['errors'])
        return value
    
    def validate(self, data):
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({'new_password_confirm': 'New passwords do not match.'})
        
        if data.get('current_password') == data.get('new_password'):
            raise serializers.ValidationError({'new_password': 'New password must be different from the current password.'})
        
        return data 