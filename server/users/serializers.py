from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model - used for general user data"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'level', 'points', 
                  'email_verified', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login', 'email_verified', 'role', 'level', 'points']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for registering new users"""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['email', 'username', 'password', 'password_confirm']
        # Disable the automatic uniqueness validation
        extra_kwargs = {
            'username': {'validators': []},
            'email': {'validators': []},
            'password': {'validators': []},
            'password_confirm': {'validators': []}
        }

    def validate_username(self, value):
        """Validate that username is unique and has proper format"""
        # Handle uniqueness validation before Django's built-in validator can interfere
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken")
        
        if len(value) < 3:
            raise serializers.ValidationError("Username must be at least 3 characters")
        
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores")
        
        return value
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        
        return value

    def validate_password(self, value):
        """Validate password complexity"""
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value) and re.search(r'[a-z]', value) and re.search(r'[0-9]', value)):
            raise serializers.ValidationError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        
        return value

    def validate(self, attrs):
        # Check that passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        
        return attrs
    
    def create(self, validated_data):
        # Remove password_confirm as we don't need it anymore
        validated_data.pop('password_confirm')
        
        # Create user instance
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data['username'],
            password=validated_data['password']
        )
        
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})

    def validate(self, attrs):
        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password")
        return user
    


class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password"""
    
    old_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    new_password_confirm = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate_new_password(self, value):
        """Validate password complexity"""
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value) and re.search(r'[a-z]', value) and re.search(r'[0-9]', value)):
            raise serializers.ValidationError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        
        return value
    
    def validate(self, attrs):
        # Check that passwords match
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({"new_password_confirm": "Passwords don't match"})
        
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for requesting a password reset"""
    
    email = serializers.EmailField(required=True)


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for confirming a password reset"""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    def validate_password(self, value):
        """Validate password complexity"""
        # Check minimum length
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters")
        
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value) and re.search(r'[a-z]', value) and re.search(r'[0-9]', value)):
            raise serializers.ValidationError("Password must contain at least one uppercase letter, one lowercase letter, and one number")
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError(e.messages)
        
        return value
    
    def validate(self, attrs):
        # Check that passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        
        return attrs 


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for admin to manage users with extended permissions"""
    
    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'role', 'level', 'points', 
                  'email_verified', 'is_active', 'date_joined', 'last_login']
        read_only_fields = ['id', 'date_joined', 'last_login']
    
    def validate_email(self, value):
        # Check if the email already exists (for a different user when updating)
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_username(self, value):
        # Check if the username already exists (for a different user when updating)
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(username=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    current_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    new_email = serializers.EmailField(required=False, write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'current_password', 'new_email']
    
    def validate_username(self, value):
        # Check if the username already exists (for a different user)
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(username=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value
    
    def validate_new_email(self, value):
        # Check if the email already exists (for a different user)
        user_id = self.instance.id if self.instance else None
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_current_password(self, value):
        # Check if current password is correct
        user = self.context.get('request').user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
        
    def update(self, instance, validated_data):
        # Only update username, email will be handled separately
        if 'username' in validated_data:
            instance.username = validated_data['username']
            instance.save(update_fields=['username'])
        
        return instance


class EmailChangeRequestSerializer(serializers.Serializer):
    """Serializer for requesting an email change"""
    new_email = serializers.EmailField(required=True)
    current_password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    def validate_new_email(self, value):
        # Check if the email already exists
        user_id = self.context.get('request').user.id
        if User.objects.filter(email=value).exclude(id=user_id).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value
    
    def validate_current_password(self, value):
        # Check if current password is correct
        user = self.context.get('request').user
        if not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value


class EmailChangeConfirmSerializer(serializers.Serializer):
    """Serializer for confirming an email change with OTP"""
    otp_code = serializers.CharField(required=True, min_length=6, max_length=6) 