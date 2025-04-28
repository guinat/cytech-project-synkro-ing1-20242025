from django.db import migrations

def update_roles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    # Tous ceux qui n'étaient pas VISITOR deviennent OWNER
    User.objects.exclude(role='VISITOR').update(role='OWNER')
    # Tous les VISITOR deviennent GUEST
    User.objects.filter(role='VISITOR').update(role='GUEST')

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(update_roles),
    ]
