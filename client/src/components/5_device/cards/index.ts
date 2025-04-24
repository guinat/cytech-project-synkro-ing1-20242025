import SmartBulbCard from './SmartBulbCard';
import SmartThermostatCard from './SmartThermostatCard';
import SecurityCameraCard from './SecurityCameraCard';
import SmartPlugCard from './SmartPlugCard';
import DoorSensorCard from './DoorSensorCard';
import SmokeDetectorCard from './SmokeDetectorCard';
import BaseDeviceCard from './BaseDeviceCard';

export {
  SmartBulbCard,
  SmartThermostatCard,
  SecurityCameraCard,
  SmartPlugCard,
  DoorSensorCard,
  SmokeDetectorCard,
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
    default:
      return BaseDeviceCard;
  }
}; 