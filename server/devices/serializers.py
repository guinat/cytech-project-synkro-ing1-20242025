from rest_framework import serializers
from .models import TV, Light, SmartLock  # Importe tes modèles

class TVSerializer(serializers.ModelSerializer):
    class Meta:
        model = TV
        fields = '__all__'  # Sérialise tous les champs du modèle TV

class LightSerializer(serializers.ModelSerializer):
    # Nous ajoutons un champ d'état modifiable ici
    toggle_state = serializers.BooleanField(write_only=True, required=False)

    class Meta:
        model = Light
        fields = '__all__'

    def update(self, instance, validated_data):
        # Si le champ 'toggle_state' est présent, on change l'état de la lampe
        toggle_state = validated_data.get('toggle_state', None)
        if toggle_state is not None:
            instance.is_on = toggle_state  # Modifie l'état de la lampe
        instance.save()
        return instance

class SmartLockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SmartLock
        fields = '__all__'  # Sérialise tous les champs du modèle SmartLocks
