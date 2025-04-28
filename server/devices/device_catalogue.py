
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