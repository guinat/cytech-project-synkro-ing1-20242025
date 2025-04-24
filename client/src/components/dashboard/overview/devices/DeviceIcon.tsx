import React from 'react';

const DeviceIcon: React.FC<{ type: string }> = ({ type }) => {
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('tv')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  
  if (lowerType.includes('router')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="8" width="20" height="8" rx="2" />
        <line x1="6" y1="12" x2="6" y2="12" />
        <line x1="10" y1="12" x2="10" y2="12" />
      </svg>
    );
  }
  
  if (lowerType.includes('wifi')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    );
  }
  
  if (lowerType.includes('heater')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.32 12.33a4.21 4.21 0 0 0 0-8.66M16 8.83V4h-.8C9.03 4 4 9.03 4 15.2c0 2.2.53 4.28 1.45 6.12A3.14 3.14 0 0 0 8.32 23h7.37a3.14 3.14 0 0 0 2.86-1.68c.93-1.84 1.45-3.92 1.45-6.12 0-2.94-1.03-5.63-2.74-7.73" />
        <path d="M12 19a4 4 0 0 1-4-4c0-3 4-9 4-9s4 6 4 9a4 4 0 0 1-4 4Z" />
      </svg>
    );
  }
  
  if (lowerType.includes('socket')) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M10 10v4" />
        <path d="M14 10v4" />
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