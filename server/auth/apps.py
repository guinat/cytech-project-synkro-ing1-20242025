from django.apps import AppConfig


class AuthApiConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth"
    label= "custom_auth"
