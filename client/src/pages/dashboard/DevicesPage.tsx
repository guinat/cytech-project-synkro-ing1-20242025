import React from 'react';
import { getPublicDeviceTypes, PublicDeviceType } from '@/services/devices.service';
import { getDeviceCardComponent } from '@/components/5_device/cards';

const DevicesPage: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = React.useState<PublicDeviceType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    getPublicDeviceTypes()
      .then(setDeviceTypes)
      .catch((e) => setError(e.message || 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg">Chargement du catalogue...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Catalogue des objets connectés</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {deviceTypes.map((deviceType) => {
          const DeviceCardComponent = getDeviceCardComponent(deviceType.name);
          return <DeviceCardComponent key={deviceType.id} device={deviceType} />;
        })}
      </div>
    </div>
  );
};

export default DevicesPage;