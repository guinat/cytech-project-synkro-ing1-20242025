# Generated by Django 5.2 on 2025-04-30 08:46

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("devices", "0002_device_brand"),
    ]

    operations = [
        migrations.CreateModel(
            name="DeviceEnergyHistory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("timestamp", models.DateTimeField(auto_now_add=True)),
                ("consumption_kw", models.FloatField()),
                (
                    "device",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE, to="devices.device"
                    ),
                ),
            ],
            options={
                "ordering": ["timestamp"],
                "indexes": [
                    models.Index(
                        fields=["device", "timestamp"],
                        name="devices_dev_device__b43928_idx",
                    )
                ],
            },
        ),
    ]
