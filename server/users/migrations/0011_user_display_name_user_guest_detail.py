# Generated by Django 5.1.5 on 2025-04-29 08:57

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0010_alter_user_role'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='display_name',
            field=models.CharField(blank=True, help_text="Nom à afficher pour l'invité", max_length=150, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='guest_detail',
            field=models.CharField(blank=True, help_text="Détail ou catégorie de l'invité (ex: enfant, voisin, cousin)", max_length=100, null=True),
        ),
    ]
