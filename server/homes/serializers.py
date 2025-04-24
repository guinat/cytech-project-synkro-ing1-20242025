from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Home, HomeInvitation
from django.utils import timezone
from datetime import timedelta

User = get_user_model()


class HomeSerializerMixin:
    def validate_name(self, value):
        if len(value) > 100:
            raise serializers.ValidationError("Home name must be less than 100 characters.")
        return value

    def validate(self, attrs):
        user = self.context['request'].user
        if getattr(self, 'instance', None) is not None:
            return attrs
        if hasattr(user, 'can_add_home') and not user.can_add_home():
            raise serializers.ValidationError("You cannot have more than 3 homes.")
        return attrs

class HomeSerializer(HomeSerializerMixin, serializers.ModelSerializer):

    owner_id = serializers.PrimaryKeyRelatedField(source='owner', read_only=True)
    owner_name = serializers.SerializerMethodField()
    rooms_count = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Home
        fields = [
            'id', 'name', 'color', 'owner', 'owner_id', 'owner_name', 'created_at', 'updated_at',
            'rooms_count', 'members_count'
        ]
        read_only_fields = ['id', 'owner', 'owner_email', 'owner_name', 'created_at', 'updated_at']
    
    def get_owner_name(self, obj):
        return f"{obj.owner.first_name} {obj.owner.last_name}"
    
    def get_rooms_count(self, obj):
        return obj.rooms.count()
    
    def get_members_count(self, obj):
        return obj.members.count()
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['owner'] = user
        return super().create(validated_data)


class HomeDetailSerializer(HomeSerializer):
    members = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()
    
    class Meta(HomeSerializer.Meta):
        fields = HomeSerializer.Meta.fields + ['members', 'owner_id', 'permissions']
    
    def get_permissions(self, obj):
        user = self.context['request'].user
        return {
            "can_update": obj.owner == user,
            "can_delete": obj.owner == user,
            "can_invite": obj.owner == user or user in obj.members.all(),
        }
    
    def get_members(self, obj):
        members_data = []
        owner = obj.owner
        members_data.append({
            'id': owner.id,
            'email': owner.email,
            'username': getattr(owner, 'username', None),
            'name': f"{owner.first_name} {owner.last_name}",
            'avatar_url': getattr(owner, 'avatar_url', None),
            'is_owner': True,
        })
        for member in obj.members.exclude(id=owner.id):
            members_data.append({
                'id': member.id,
                'email': member.email,
                'username': getattr(member, 'username', None),
                'name': f"{member.first_name} {member.last_name}",
                'avatar_url': getattr(member, 'avatar_url', None),
                'is_owner': False,
            })
        return members_data


class HomeInvitationSerializer(serializers.ModelSerializer):
    home_name = serializers.CharField(source='home.name', read_only=True)
    inviter_name = serializers.SerializerMethodField()
    
    class Meta:
        model = HomeInvitation
        fields = [
            'id', 'home', 'home_name', 'inviter', 'inviter_name', 'email',
            'status', 'created_at', 'updated_at', 'expires_at'
        ]
        read_only_fields = [
            'id', 'home', 'home_name', 'inviter', 'inviter_name', 
            'status', 'created_at', 'updated_at', 'expires_at'
        ]
    
    def get_inviter_name(self, obj):
        return f"{obj.inviter.first_name} {obj.inviter.last_name}"
    
    def validate_email(self, value):
        home = self.context['home']
        try:
            user = User.objects.get(email=value)
            if home.owner.email == value:
                raise serializers.ValidationError("This user is already the owner of the home.")
            if user in home.members.all():
                raise serializers.ValidationError("This user is already a member of the home.")
        except User.DoesNotExist:
            pass
        now = timezone.now()
        invitations = HomeInvitation.objects.filter(
            home=home,
            email=value,
            status=HomeInvitation.Status.PENDING,
            expires_at__gt=now
        )
        if invitations.exists():
            raise serializers.ValidationError("An active invitation already exists for this email.")
        return value
    
    def validate_status(self, value):
        statuses = [choice[0] for choice in HomeInvitation.Status.choices]
        if value not in statuses:
            raise serializers.ValidationError(f"Status must be one of: {statuses}")
        return value
    
    def create(self, validated_data):
        from utils.emails import send_email
        user = self.context['request'].user
        home = self.context['home']
        validated_data['inviter'] = user
        validated_data['home'] = home
        validated_data['status'] = HomeInvitation.Status.PENDING
        validated_data['expires_at'] = timezone.now() + timedelta(days=7)
        invitation = super().create(validated_data)
        context = {
            'home_id': str(home.id),
            'email': invitation.email,
            'role': getattr(invitation, 'role', 'MEMBER'),
        }
        send_email(user, 'invitation', context=context)
        return invitation