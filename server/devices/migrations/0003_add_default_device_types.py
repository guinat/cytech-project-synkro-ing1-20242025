from django.db import migrations

def add_default_device_types(apps, schema_editor):
    """
    Add default device types for a smart home system
    """
    DeviceType = apps.get_model('devices', 'DeviceType')
    
    # Define default device types with their descriptions and capabilities
    default_types = [
        {
            'name': 'Smart Light',
            'description': 'Smart light bulb that can be switched on/off and dimmed'
        },
        {
            'name': 'Smart Thermostat',
            'description': 'Temperature control device for rooms or zones'
        },
        {
            'name': 'Smart Plug',
            'description': 'Smart power outlet that can be switched on/off'
        },
        {
            'name': 'Motion Sensor',
            'description': 'Detects movement in a room or area'
        },
        {
            'name': 'Door/Window Sensor',
            'description': 'Detects if a door or window is open or closed'
        },
        {
            'name': 'Temperature Sensor',
            'description': 'Measures room temperature'
        },
        {
            'name': 'Humidity Sensor',
            'description': 'Measures room humidity'
        },
        {
            'name': 'Smart Speaker',
            'description': 'Audio device with voice control capabilities'
        },
        {
            'name': 'Smart Camera',
            'description': 'Security camera with remote viewing'
        },
        {
            'name': 'Smart Lock',
            'description': 'Door lock that can be controlled remotely'
        }
    ]
    
    # Add each device type if it doesn't already exist
    for device_type in default_types:
        DeviceType.objects.get_or_create(
            name=device_type['name'],
            defaults={'description': device_type['description']}
        )

def remove_default_device_types(apps, schema_editor):
    """
    Remove the default device types
    """
    DeviceType = apps.get_model('devices', 'DeviceType')
    
    # Get the names of default device types
    default_type_names = [
        'Smart Light', 'Smart Thermostat', 'Smart Plug', 'Motion Sensor',
        'Door/Window Sensor', 'Temperature Sensor', 'Humidity Sensor',
        'Smart Speaker', 'Smart Camera', 'Smart Lock'
    ]
    
    # Delete the default device types
    DeviceType.objects.filter(name__in=default_type_names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('devices', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(add_default_device_types, remove_default_device_types),
    ] 