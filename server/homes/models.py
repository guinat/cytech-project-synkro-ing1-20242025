import uuid
from django.db import models
from django.conf import settings


class Home(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100) 
    color = models.CharField(max_length=16, blank=True, null=True, default="#D1D5DB")  # Couleur personnalisée
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='owned_homes'
    )
    members = models.ManyToManyField(
        settings.AUTH_USER_MODEL, 
        related_name='member_homes',
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.name} ({self.city})"
    
    class Meta:
        verbose_name = 'Home'
        verbose_name_plural = 'Homes'
        ordering = ['-created_at']


class HomeInvitation(models.Model):
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        ACCEPTED = 'accepted', 'Accepted'
        DECLINED = 'declined', 'Declined'
        EXPIRED = 'expired', 'Expired'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    home = models.ForeignKey(
        Home, 
        on_delete=models.CASCADE, 
        related_name='invitations'
    )
    inviter = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='sent_invitations'
    )
    email = models.EmailField()
    status = models.CharField(
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    
    def __str__(self):
        return f"Invitation for {self.email} to {self.home.name}"
    
    class Meta:
        verbose_name = 'Home Invitation'
        verbose_name_plural = 'Home Invitations'
        ordering = ['-created_at']
        unique_together = ('home', 'email')
