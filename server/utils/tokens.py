import jwt
from datetime import datetime, timedelta, timezone
from django.conf import settings
import uuid


class TokenGenerator:

    @staticmethod
    def generate_action_link(user, action, request=None):
        if action == "email_verification":
            token = TokenGenerator.generate_user_token(user.id, "email_verification", expiry_time_minutes=15)
            path = f"/auth/verify-email/{token}"
        elif action == "password_reset":
            token = TokenGenerator.generate_user_token(user.id, "password_reset", expiry_time_minutes=15)
            path = f"/auth/password-reset/{token}"
        else:
            raise ValueError("Unknown action for token generation")
        return f"http://localhost:5173{path}"

    @staticmethod
    def _generate_jwt_token(payload, expiry_time_minutes=15):
        payload['exp'] = datetime.now(timezone.utc) + timedelta(minutes=expiry_time_minutes)
        payload['iat'] = datetime.now(timezone.utc)
        
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def generate_user_token(user_id, token_type, expiry_time_minutes=15):
        payload = {
            'user_id': str(user_id),
            'type': token_type
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_device_token(device_id, token_type, expiry_time_minutes=15):
        payload = {
            'device_id': str(device_id),
            'type': token_type
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_home_invitation_token(home_id, email, role, expiry_time_minutes=15):
        payload = {
            'home_id': str(home_id),
            'email': email,
            'role': role,
            'type': 'home_invitation'
        }
        return TokenGenerator._generate_jwt_token(payload, expiry_time_minutes)
    
    @staticmethod
    def generate_uuid_token():
        return str(uuid.uuid4())
    
    @staticmethod
    def verify_jwt_token(token, expected_type=None):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            if expected_type and payload.get('type') != expected_type:
                return None
            
            return payload
            
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def get_user_from_token(token, token_type=None):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        payload = TokenGenerator.verify_jwt_token(token, token_type)
        if not payload or 'user_id' not in payload:
            return None
        
        return User.objects.filter(id=payload['user_id']).first()
    
    @staticmethod
    def get_device_from_token(token, token_type=None):
        from devices.models import Device
        
        payload = TokenGenerator.verify_jwt_token(token, token_type)
        if not payload or 'device_id' not in payload:
            return None
        
        return Device.objects.filter(id=payload['device_id']).first()
    
    @staticmethod
    def get_home_invitation_data(token):
        return TokenGenerator.verify_jwt_token(token, 'home_invitation') 