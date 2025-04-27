import React from 'react';
import { getPublicDeviceTypes, PublicDeviceType } from '@/services/devices.service';
import { getDeviceCardComponent } from '@/components/5_device/cards';

const DevicesPage: React.FC = () => {
  const [deviceTypes, setDeviceTypes] = React.useState<PublicDeviceType[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

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

  // Filtrage des devices selon la recherche (nom ou description)
  const filteredDeviceTypes = deviceTypes.filter(deviceType =>
    deviceType.name.toLowerCase().includes(search.toLowerCase()) ||
    (deviceType.description && deviceType.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Catalogue des objets connectés</h1>
      {/* Barre de recherche */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Rechercher un appareil..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-md px-4 py-2 w-full max-w-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredDeviceTypes.map((deviceType) => {
          const DeviceCardComponent = getDeviceCardComponent(deviceType.name);
          return <DeviceCardComponent key={deviceType.id} device={deviceType} />;
        })}
      </div>
    </div>
  );
};

export default DevicesPage;