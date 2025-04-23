import re
from typing import Any, Dict, List, Union
from django.contrib.auth import get_user_model

User = get_user_model()

def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> Dict[str, Union[bool, List[str]]]:
    errors = []    
    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    if not any(char.isupper() for char in password):
        errors.append("Password must contain at least one uppercase letter")
    if not any(char.islower() for char in password):
        errors.append("Password must contain at least one lowercase letter")
    if not any(char.isdigit() for char in password):
        errors.append("Password must contain at least one number")
    if not any(char in "!@#$%^&*()-_=+[]{}|;:,.<>?/" for char in password):
        errors.append("Password must contain at least one special character")
    return {
        "valid": len(errors) == 0,
        "errors": errors
    }


def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> Dict[str, Union[bool, List[str]]]:
    missing = [field for field in required_fields if field not in data or data[field] is None]
    return {
        "valid": len(missing) == 0,
        "missing": missing
    } 


def is_email_exists(email: str) -> bool:
    return User.objects.filter(email=email).exists()


def is_username_exists(username: str) -> bool:
    return User.objects.filter(username=username).exists()