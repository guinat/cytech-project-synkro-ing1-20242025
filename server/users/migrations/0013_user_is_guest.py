from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ("users", "0012_user_invited_by"),
    ]

    operations = [
        migrations.AddField(
            model_name="user",
            name="is_guest",
            field=models.BooleanField(default=False, help_text="Désigne si l'utilisateur est un invité."),
        ),
    ]
