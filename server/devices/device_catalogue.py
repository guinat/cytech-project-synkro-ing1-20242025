#Definition of every device type

DEVICE_TYPES = [
    {
        "type": "smart_bulb_x",
        "name": "Smart Bulb X",
        "brand": "Philips",
        "description": "Control lighting, color, and brightness in you rooms.",
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
        "brand": "Samsung",
        "description": "Automated shutter to control sunlight and privacy.",
        "capabilities": ["on_off", "position"],
    },
    {
        "type": "smart_television_x",
        "name": "Smart Television X",
        "brand": "Samsung",
        "description": "Stream your favorite content and adjust volume.",
        "capabilities": ["on_off", "volume", "channel"],
    },
    {
        "type": "smart_oven_x",
        "name": "Smart Oven X",
        "brand": "Bosch",
        "description": "Cook meals remotely with precision and safety.",
        "capabilities": ["on_off", "heat"],
    },
    {
        "type": "smart_fridge_x",
        "name": "Smart Fridge X",
        "brand": "Samsung",
        "description": "Keep food fresh and adjust consumption mode.",
        "capabilities": ["on_off", "mode"],
    },
    {
        "type": "smart_doorlocker_x",
        "name": "Smart Doorlocker X",
        "brand": "Apple",
        "description": "Secure access with remote locking.",
        "capabilities": ["on_off"],
    },
    {
        "type": "smart_speaker_x",
        "name": "Smart Speaker X",
        "brand": "Apple",
        "description": "Control your music and adjust volume.",
        "capabilities": ["on_off", "volume", "trackIndex"],
    },
    {
        "type": "security_camera_x",
        "name": "Security Camera X",
        "brand": "Nest",
        "description": "Monitor your home.",
        "capabilities": ["on_off", "video_stream", "motion_detection"],
    },
    {
        "type": "dish_washer",
        "name": "Dish Washer",
        "brand": "Bosch",
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