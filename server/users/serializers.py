from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
import re
import base64
import imghdr

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model - used for profile view"""
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'home_role', 'avatar_url',
            'role', 'level', 'points', 'email_verified',
            'is_profile_completed', 'date_joined', 'last_login'
        ]
        read_only_fields = [
            'id', 'email', 'role', 'level', 'points', 'email_verified', 
            'date_joined', 'last_login', 'is_profile_completed'
        ]
    
    def get_avatar_url(self, obj):
        if obj.avatar and obj.avatar_mime_type:
            return f"data:{obj.avatar_mime_type};base64,{obj.avatar}"
        return None


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
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError({"username": "This username is already taken"})
        
        if len(value) < 3:
            raise serializers.ValidationError({"username": "Username must be at least 3 characters"})
        
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError({"username": "Username can only contain letters, numbers, and underscores"})
        
        return value
    
    def validate_email(self, value):
        """Validate that email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError({"email": "This email is already registered"})
        
        return value

    def validate_password(self, value):
        """Validate password complexity"""
        if len(value) < 8:
            raise serializers.ValidationError({"password": "Password must be at least 8 characters"})
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter"})
        if not (re.search(r'[a-z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter"})
        if not (re.search(r'[0-9]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one digit"})
        if not (re.search(r'[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one special character"})
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
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
            raise serializers.ValidationError({"password": "Password must be at least 8 characters"})
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter"})
        if not (re.search(r'[a-z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter"})
        if not (re.search(r'[0-9]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one digit"})
        if not (re.search(r'[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one special character"})
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
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
            raise serializers.ValidationError({"password": "Password must be at least 8 characters"})
        # Check for uppercase, lowercase and digit
        if not (re.search(r'[A-Z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one uppercase letter"})
        if not (re.search(r'[a-z]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one lowercase letter"})
        if not (re.search(r'[0-9]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one digit"})
        if not (re.search(r'[!@#$%^&*()_+{}\[\]:;<>,.?~\\-]', value)):
            raise serializers.ValidationError({"password": "Password must contain at least one special character"})
        
        # Use Django's built-in validator as well
        try:
            validate_password(value)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
        return value
    
    def validate(self, attrs):
        # Check that passwords match
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password_confirm": "Passwords don't match"})
        
        return attrs 


class AdminUserSerializer(serializers.ModelSerializer):
    """Admin-only serializer for updating user data"""
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'gender', 'date_of_birth', 'home_role', 'avatar_url',
            'role', 'level', 'points', 'email_verified', 
            'is_staff', 'is_superuser'
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'last_login']
    
    def get_avatar_url(self, obj):
        if obj.avatar and obj.avatar_mime_type:
            return f"data:{obj.avatar_mime_type};base64,{obj.avatar}"
        return None


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    current_password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})
    new_email = serializers.EmailField(required=False, write_only=True)
    profile_picture = serializers.CharField(required=False)
    
    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 
            'gender', 'date_of_birth', 'home_role',
            'current_password', 'new_email', 'profile_picture'
        ]
    
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
        # Get the user from the request
        user = self.context.get('request').user
        
        # If this is the first profile completion (is_profile_completed=False), ignore password validation
        if not user.is_profile_completed:
            return value
        
        # For users who already have a complete profile, check the password
        if value and not user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value
    
    def validate_profile_picture(self, value):
        if value and not isinstance(value, str):
            raise serializers.ValidationError("Profile picture must be a base64 encoded string")
        return value
        
    def update(self, instance, validated_data):
        # Remove fields that should be handled separately
        current_password = validated_data.pop('current_password', None)
        new_email = validated_data.pop('new_email', None)
        
        # For updates that require password verification
        # (email change, etc.), only if the user has a complete profile
        if instance.is_profile_completed:
            if new_email and current_password and instance.check_password(current_password):
                # Email change logic would go here
                pass
        else:
            # For first profile completion, allow updates without password
            pass
        
        # Handle profile picture
        profile_picture = validated_data.pop('profile_picture', None)
        if profile_picture:
            try:
                if ',' in profile_picture:
                    # Format: data:image/png;base64,BASE64DATA
                    header, b64data = profile_picture.split(',', 1)
                    
                    if ';base64' in header:
                        mime_type = header.split(':')[1].split(';')[0]
                        
                        # Save avatar data
                        instance.avatar = b64data
                        instance.avatar_mime_type = mime_type
                    else:
                        raise serializers.ValidationError({"profile_picture": "Invalid format, no base64 encoding found"})
                else:
                    # If no separator, try to store directly as base64
                    instance.avatar = profile_picture
                    instance.avatar_mime_type = "image/png"  # Default MIME type
            except Exception as e:
                # Don't raise an error, just continue with other fields
                pass
        
        # Update the instance with the validated data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Check if profile is completed
        is_complete = all([
            instance.username,
            instance.first_name,
            instance.last_name,
            instance.date_of_birth,
            instance.gender,
            # Add any other fields that are required for a complete profile
        ])
        
        # Update the is_profile_completed field
        instance.is_profile_completed = is_complete
        
        instance.save()
        
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


class AvatarUploadSerializer(serializers.Serializer):
    """Serializer for uploading and processing user avatars"""
    
    avatar = serializers.ImageField(write_only=True)
    
    def validate_avatar(self, value):
        """Validate the avatar file"""
        # Check file size (max 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Image file too large (max 5MB)")
        
        # Check image format
        allowed_formats = ['jpeg', 'jpg', 'png', 'gif']
        image_format = imghdr.what(value)
        
        if image_format not in allowed_formats:
            raise serializers.ValidationError(
                f"Unsupported image format. Allowed formats: {', '.join(allowed_formats)}"
            )
            
        return value
    
    def save(self, **kwargs):
        """Convert the image to base64 and save to user model"""
        user = self.context['request'].user
        image_file = self.validated_data['avatar']
        
        # Get file content and encode to base64
        file_content = image_file.read()
        encoded_content = base64.b64encode(file_content).decode('utf-8')
        
        # Determine MIME type
        mime_type = image_file.content_type
        
        # Save to user model
        user.avatar = encoded_content
        user.avatar_mime_type = mime_type
        user.save(update_fields=['avatar', 'avatar_mime_type'])
        
        return user 