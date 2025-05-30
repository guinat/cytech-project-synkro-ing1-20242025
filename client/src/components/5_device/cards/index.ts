import SmartBulbCard from './SmartBulbCard';
import SmartThermostatCard from './SmartThermostatCard';
import SecurityCameraCard from './SecurityCameraCard';
import SmartPlugCard from './SmartPlugCard';
import DoorSensorCard from './DoorSensorCard';
import SmokeDetectorCard from './SmokeDetectorCard';
import BaseDeviceCard from './BaseDeviceCard';
import DishWasherCard from './DishWasherCard';
import WhashingMachineCard from './WhashingMachineCard';

export {
  SmartBulbCard,
  SmartThermostatCard,
  SecurityCameraCard,
  SmartPlugCard,
  DoorSensorCard,
  SmokeDetectorCard,
  DishWasherCard,
  WhashingMachineCard,
  BaseDeviceCard
};

export const getDeviceCardComponent = (deviceName: string) => {
  switch (deviceName) {
    case 'Smart Bulb':
      return SmartBulbCard;
    case 'Smart Thermostat':
      return SmartThermostatCard;
    case 'Security Camera':
      return SecurityCameraCard;
    case 'Smart Plug':
      return SmartPlugCard;
    case 'Door Sensor':
      return DoorSensorCard;
    case 'Smoke Detector':
      return SmokeDetectorCard;
    case 'Smart Dish Washer':
      return DishWasherCard;
    case 'Smart Washing MAchine':
      return WhashingMachineCard;
    default:
      return BaseDeviceCard;
  }
}; 