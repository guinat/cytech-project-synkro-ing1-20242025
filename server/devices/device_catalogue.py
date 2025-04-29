DEVICE_TYPES = [
    {
        "type": "smart_bulb_x",
        "name": "Smart Bulb X",
        "description": "Control lighting, color, and brightness.",
        "capabilities": ["on_off", "brightness", "color"],
    },
    {
        "type": "smart_thermostat_x",
        "name": "Smart Thermostat X",
        "description": "Manage your home temperature.",
        "capabilities": ["on_off", "temperature"],
    },
    {
        "type": "smart_shutter_x",
        "name": "Smart Shutter X",
        "description": "Manage how much your shutter is open.",
        "capabilities": ["on_off", "position"],
    },
    {
        "type": "smart_television_x",
        "name": "Smart Television X",
        "description": "Manage your television state.",
        "capabilities": ["on_off", "volume", "channel"],
    },
    {
        "type": "smart_oven_x",
        "name": "Smart Oven X",
        "description": "Manage your oven state.",
        "capabilities": ["on_off", "heat"],
    },
    {
        "type": "smart_fridge_x",
        "name": "Smart Fridge X",
        "description": "Manage your fridge state.",
        "capabilities": ["on_off", "mode"],
    },
    {
        "type": "smart_doorlocker_x",
        "name": "Smart Doorlocker X",
        "description": "Manage your door locker state.",
        "capabilities": ["on_off"],
    },
    {
        "type": "smart_speaker_x",
        "name": "Smart Speaker X",
        "description": "Control your music and volume.",
        "capabilities": ["on_off", "volume", "trackIndex"],
    },
]

DEVICE_TYPE_MAP = {d["type"]: d for d in DEVICE_TYPES}

#TODO: Add more device types