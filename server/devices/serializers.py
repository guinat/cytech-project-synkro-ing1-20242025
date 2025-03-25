from rest_framework import serializers
from .models import TV, Light, SmartLock  # Importe tes modèles

class TVSerializer(serializers.ModelSerializer):
    class Meta:
        model = TV
        fields = '__all__'  # Sérialise tous les champs du modèle TV

class LightSerializer(serializers.ModelSerializer):
    class Meta:
        model = Light
        fields = '__all__'  # Sérialise tous les champs du modèle Lights

class SmartLockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartLock
        fields = '__all__'  # Sérialise tous les champs du modèle SmartLocks
