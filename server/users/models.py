import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# from .models_login_history import LoginHistory


class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        if not username:
            raise ValueError('The Username field must be set')
        
        email = self.normalize_email(email)
        user = self.model(email=email,username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user
    
    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('role', 'ADMIN')
        
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractUser):
    is_guest = models.BooleanField(default=False, help_text="Désigne si l'utilisateur est un invité.")
    def can_add_home(self):
        from homes.models import Home
        from django.db.models import Q
        total = Home.objects.filter(Q(owner=self) | Q(members=self)).distinct().count()
        return total < 3

    ROLES = [
        ('VISITOR', 'Visitor'),
        ('USER', 'User'),
        ('ADMIN', 'Admin'),
    ]

    LEVELS = [
        ('BEGINNER', 'Beginner'),
        ('INTERMEDIATE', 'Intermediate'),
        ('ADVANCED', 'Advanced'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Rôle de l'utilisateur (VISITOR = invité, USER = membre, ADMIN = admin)
    role = models.CharField(max_length=16, choices=ROLES, default='VISITOR')
    # Permissions spécifiques pour les invités, ex: {"can_view": true, "can_control": false, "can_add": false}
    guest_permissions = models.JSONField(default=dict, blank=True)

    def is_guest(self):
        return self.role == 'VISITOR'

    email = models.EmailField(unique=True)
    username = models.CharField(max_length=150, null=True, blank=True)

    profile_photo = models.TextField(null=True, blank=True)

    display_name = models.CharField(
        max_length=150, blank=True, null=True, help_text="Nom à afficher pour l'invité"
    )
    guest_detail = models.CharField(
        max_length=100, blank=True, null=True, help_text="Détail ou catégorie de l'invité (ex: enfant, voisin, cousin)"
    )

    is_email_verified = models.BooleanField(default=False)

    role = models.CharField(max_length=50, choices=ROLES, default='VISITOR')
    #guest_permissions = models.JSONField(null=True, blank=True, help_text="Permissions personnalisées pour les invités (ex: { 'can_view': True, 'can_control': False, 'can_add': False })")
    points = models.IntegerField(default=0)
    level = models.CharField(max_length=50, choices=LEVELS, default='BEGINNER')

    invited_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='invited_guests'
    )

    invited_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='invited_guests'
    )

    date_joined = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    def __str__(self):
        return self.email

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']
