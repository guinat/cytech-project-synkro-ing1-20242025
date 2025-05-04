import React from 'react';

// we generate the icon based on the type of the device, and using svg

const DeviceIcon: React.FC<{ type: string }> = ({ type }) => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('television')) {
    return (
      <svg xmlns="C" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="15" x="2" y="7" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    );
  }
  
  if (lowerType.includes('speaker')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <circle cx="12" cy="14" r="4" />
        <line x1="12" x2="12" y1="6" y2="6" />
      </svg>
    );
  }

  if (lowerType.includes('fridge')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <line x1="6" y1="10" x2="18" y2="10" />
        <circle cx="8.5" cy="6" r="0.7" />
        <circle cx="8.5" cy="14" r="0.7" />
      </svg>
    );
  }

  if (lowerType.includes('oven')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <rect x="7" y="9" width="10" height="8" rx="1" />
        <circle cx="8.5" cy="7.5" r="0.7" />
        <circle cx="12" cy="7.5" r="0.7" />
        <circle cx="15.5" cy="7.5" r="0.7" />
      </svg>
    );
  }

  if (lowerType.includes('light') || lowerType.includes('bulb')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="10" r="5" />
        <rect x="10" y="15" width="4" height="5" rx="1" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
      </svg>
    );
  }

  if (lowerType.includes('shutter')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <line x1="4" y1="8" x2="20" y2="8" />
        <line x1="4" y1="12" x2="20" y2="12" />
        <line x1="4" y1="16" x2="20" y2="16" />
      </svg>
    );
  }

  if (lowerType.includes('locker') || lowerType.includes('lock')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        <circle cx="12" cy="16" r="1.5" />
      </svg>
    );
  }

  if (lowerType.includes('thermostat')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="2" width="8" height="12" rx="4" />
        <line x1="12" y1="14" x2="12" y2="22" />
        <circle cx="12" cy="18" r="4" />
      </svg>
    );
  }

  if (lowerType.includes('camera')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="10" rx="2" />
        <circle cx="12" cy="12" r="3" />
        <rect x="9" y="17" width="6" height="2" rx="1" />
      </svg>
    );
  }

  if (lowerType.includes('dish_washer') || lowerType.includes('dishwasher')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="9" cy="15" r="1.5" />
        <circle cx="15" cy="15" r="1.5" />
        <rect x="8" y="7" width="8" height="4" rx="1" />
      </svg>
    );
  }

  if (lowerType.includes('washing_machine') || lowerType.includes('washingmachine')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <circle cx="12" cy="14" r="5" />
        <circle cx="12" cy="14" r="2" />
        <rect x="8" y="7" width="8" height="2" rx="1" />
      </svg>
    );
  }
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9V5c0-1.1.9-2 2-2h4m-2 8V8h16v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1" />
      <path d="M13 15v-2" />
    </svg>
  );
};

export default DeviceIcon; 