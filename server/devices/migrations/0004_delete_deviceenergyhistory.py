# Generated by Django 5.2 on 2025-04-30 09:04

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("devices", "0003_deviceenergyhistory"),
    ]

    operations = [
        migrations.DeleteModel(
            name="DeviceEnergyHistory",
        ),
    ]
