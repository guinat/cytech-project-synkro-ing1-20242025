from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        if not username:
            raise ValueError('Username is required')
        
        email = self.normalize_email(email)
        user = self.model(email=email, username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = (
        ('user', 'User'),
        ('admin', 'Administrator'),
    )
    
    LEVEL_CHOICES = (
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
        ('expert', 'Expert'),
    )
    
    email = models.EmailField(unique=True, verbose_name='Email address')
    username = models.CharField(max_length=150, unique=True, verbose_name='Username')
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='user', verbose_name='Role')
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES, default='beginner', verbose_name='Level')
    points = models.IntegerField(default=0, verbose_name='Points')
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False, verbose_name='Email verified')
    
    date_joined = models.DateTimeField(default=timezone.now, verbose_name='Date joined')
    last_login = models.DateTimeField(blank=True, null=True, verbose_name='Last login')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'  
    REQUIRED_FIELDS = ['username']  
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return self.username
    
    def get_level_from_points(self):
        """Determines the level based on points."""
        if self.points < 100:
            return 'beginner'
        elif self.points < 500:
            return 'intermediate'
        elif self.points < 1000:
            return 'advanced'
        else:
            return 'expert'
    
    def update_level(self):
        """Updates the level based on points."""
        self.level = self.get_level_from_points()
        self.save(update_fields=['level'])


class EmailChangeRequest(models.Model):
    """Model to store email change requests with OTP codes"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_change_requests')
    new_email = models.EmailField(verbose_name='New email address')
    otp_code = models.CharField(max_length=6, verbose_name='OTP code')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = 'Email change request'
        verbose_name_plural = 'Email change requests'
        
    def __str__(self):
        return f"Email change request for {self.user.username}"
    
    def is_valid(self):
        """Check if the OTP code is still valid"""
        return not self.is_used and self.expires_at > timezone.now()

