DEVICE_TYPES = [
    {
        "type": "smart_bulb_x",
        "name": "Smart Bulb X",
        "brand": "Xiaomi",
        "description": "Control lighting, color, and brightness.",
        "capabilities": ["on_off", "brightness", "color"],
    },
    {
        "type": "smart_thermostat_x",
        "name": "Smart Thermostat X",
        "brand": "Google",
        "description": "Manage your home temperature.",
        "capabilities": ["on_off", "temperature"],
    },
    {
        "type": "smart_shutter_x",
        "name": "Smart Shutter X",
        "brand": "Xiaomi",
        "description": "Manage how much your shutter is open.",
        "capabilities": ["on_off", "position"],
    },
    {
        "type": "smart_television_x",
        "name": "Smart Television X",
        "brand": "Xiaomi",
        "description": "Manage your television state.",
        "capabilities": ["on_off", "volume", "channel"],
    },
    {
        "type": "smart_oven_x",
        "name": "Smart Oven X",
        "brand": "Xiaomi",
        "description": "Manage your oven state.",
        "capabilities": ["on_off", "heat"],
    },
    {
        "type": "smart_fridge_x",
        "name": "Smart Fridge X",
        "brand": "Xiaomi",
        "description": "Manage your fridge state.",
        "capabilities": ["on_off", "mode"],
    },
    {
        "type": "smart_doorlocker_x",
        "name": "Smart Doorlocker X",
        "brand": "Xiaomi",
        "description": "Manage your door locker state.",
        "capabilities": ["on_off"],
    },
    {
        "type": "smart_speaker_x",
        "name": "Smart Speaker X",
        "brand": "Xiaomi",
        "description": "Control your music and volume.",
        "capabilities": ["on_off", "volume", "trackIndex"],
    },
    {
        "type": "security_camera_x",
        "name": "Security Camera X",
        "brand": "Xiaomi",
        "description": "Monitor your home",
        "capabilities": ["on_off", "video_stream", "motion_detection"],
    },
    {
        "type": "dish_washer",
        "name": "Dish Washer",
        "brand": "Philips",
        "description": "A high-efficiency dishwasher with customizable settings.",
        "capabilities": [
            "on_off", 
            "cycle_selection",
            "temperature",    
        ]
    },
    {
        "type": "washing_machine",
        "name": "Washing Machine",
        "brand": "Philips",
        "description": "A high-performance washing machine with customizable cycles.",
        "capabilities": [
            "on_off", 
            "cycle_selection",
            "temperature",
            "spin_speed_control",
        ]
    },
]

DEVICE_TYPE_MAP = {d["type"]: d for d in DEVICE_TYPES}

#TODO: Add more device types