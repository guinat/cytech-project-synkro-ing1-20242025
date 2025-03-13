import jwt
from datetime import datetime, timedelta
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class TokenGenerator:
    """Generate and validate tokens for email verification and password reset"""
    
    @staticmethod
    def _generate_token(user_id, expiry_time_minutes, token_type):
        """Generate a JWT token with payload"""
        payload = {
            'user_id': user_id,
            'type': token_type,
            'exp': datetime.utcnow() + timedelta(minutes=expiry_time_minutes),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')
    
    @staticmethod
    def generate_verification_token(user):
        """Generate a token for email verification"""
        # Token expires in 15 minutes
        return TokenGenerator._generate_token(
            user.id,
            settings.EMAIL_VERIFICATION_TIMEOUT // 60,
            'email_verification'
        )
    
    @staticmethod
    def generate_password_reset_token(user):
        """Generate a token for password reset"""
        # Token expires in 15 minutes
        return TokenGenerator._generate_token(
            user.id,
            settings.EMAIL_VERIFICATION_TIMEOUT // 60,
            'password_reset'
        )
    
    @staticmethod
    def verify_token(token, token_type):
        """Verify a token and return the user if valid"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            # Check if token type matches
            if payload['type'] != token_type:
                return None
            
            # Find the user
            user = User.objects.filter(id=payload['user_id']).first()
            if not user:
                return None
            
            return user
        except jwt.ExpiredSignatureError:
            # Token has expired
            return None
        except jwt.InvalidTokenError:
            # Token is invalid
            return None 