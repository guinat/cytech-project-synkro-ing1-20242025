import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
import uuid


class TokenGenerator:
    """
    Generic token generator for various system functions.
    Supports JWT and UUID as needed.
    """
    
    @staticmethod
    def _generate_jwt_token(payload, expiry_time_minutes=15):
        """
        Generates a JWT token with payload and expiration
        
        Args:
            payload (dict): Data to include in the token
            expiry_time_minutes (int): Validity duration in minutes
            
        Returns:
            str: The encoded JWT token
        """
        # Add expiration and issuance timestamps
        payload['exp'] = datetime.now(timezone.utc) + timedelta(minutes=expiry_time_minutes)
        payload['iat'] = datetime.now(timezone.utc)
        
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def generate_user_token(user_id, token_type, expiry_time_minutes=15):
        """
        Generates a JWT token for a user
        
        Args:
            user_id (int): User ID
            token_type (str): Token type (email_verification, password_reset, etc.)
            expiry_time_minutes (int): Validity duration in minutes
            
        Returns:
            str: The encoded JWT token
        """
        payload = {
            'user_id': user_id,
            'type': token_type
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_device_token(device_id, token_type, expiry_time_minutes=15):
        """
        Generates a JWT token for a device
        
        Args:
            device_id (int): Device ID
            token_type (str): Token type (device_auth, data_access, etc.)
            expiry_time_minutes (int): Validity duration in minutes
            
        Returns:
            str: The encoded JWT token
        """
        payload = {
            'device_id': device_id,
            'type': token_type
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_home_invitation_token(home_id, email, role, expiry_time_minutes=15):
        """
        Generates a JWT token for a home invitation
        
        Args:
            home_id (int): Home ID
            email (str): Invitee's email
            role (str): Invitee's role in the home
            expiry_time_minutes (int): Validity duration in minutes
            
        Returns:
            str: The encoded JWT token
        """
        payload = {
            'home_id': home_id,
            'email': email,
            'role': role,
            'type': 'home_invitation'
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_uuid_token():
        """
        Generates a simple UUID token
        
        Returns:
            str: Randomly generated UUID v4
        """
        return str(uuid.uuid4())
    
    @staticmethod
    def verify_jwt_token(token, expected_type=None):
        """
        Verifies a JWT token and returns the payload if valid
        
        Args:
            token (str): The JWT token to verify
            expected_type (str, optional): Expected token type, if specified
            
        Returns:
            dict or None: The decoded payload or None if the token is invalid
        """
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check type if specified
            if expected_type and payload.get('type') != expected_type:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            # Expired token
            return None
        except jwt.InvalidTokenError:
            # Invalid token
            return None
    
    @staticmethod
    def get_user_from_token(token, token_type=None):
        """
        Retrieves the user associated with a JWT token
        
        Args:
            token (str): The JWT token to verify
            token_type (str, optional): Expected token type, if specified
            
        Returns:
            User or None: The user or None if the token is invalid
        """
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        payload = TokenGenerator.verify_jwt_token(token, token_type)
        if not payload or 'user_id' not in payload:
            return None
        
        return User.objects.filter(id=payload['user_id']).first()
    
    @staticmethod
    def get_device_from_token(token, token_type=None):
        """
        Retrieves the device associated with a JWT token
        
        Args:
            token (str): The JWT token to verify
            token_type (str, optional): Expected token type, if specified
            
        Returns:
            Device or None: The device or None if the token is invalid
        """
        from server.devices.models import Device
        
        payload = TokenGenerator.verify_jwt_token(token, token_type)
        if not payload or 'device_id' not in payload:
            return None
        
        return Device.objects.filter(id=payload['device_id']).first()
    
    @staticmethod
    def get_home_invitation_data(token):
        """
        Retrieves home invitation data from a JWT token
        
        Args:
            token (str): The JWT token to verify
            
        Returns:
            dict or None: The invitation data or None if the token is invalid
        """
        return TokenGenerator.verify_jwt_token(token, 'home_invitation') 