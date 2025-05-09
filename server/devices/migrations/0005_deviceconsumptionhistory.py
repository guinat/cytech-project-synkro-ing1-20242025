# Generated by Django 5.1.5 on 2025-05-02 20:15

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('devices', '0004_delete_deviceenergyhistory'),
    ]

    operations = [
        migrations.CreateModel(
            name='DeviceConsumptionHistory',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('timestamp', models.DateTimeField()),
                ('consumption', models.FloatField(help_text='Consommation en kWh')),
                ('device', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='consumption_history', to='devices.device')),
            ],
            options={
                'verbose_name': 'Device Consumption History',
                'verbose_name_plural': 'Device Consumption Histories',
                'ordering': ['-timestamp'],
            },
        ),
    ]
