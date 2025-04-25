import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPublicDeviceTypes, PublicDeviceType } from '@/services/devices.service';
import { getDeviceCardComponent } from '@/components/5_device/cards';


const DiscoverPage = () => {
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
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Chargement du catalogue...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-red-500 text-center">{error}</div>
            </div>
        );
    }

    // Filtrage des devices selon la recherche (nom ou description)
    const filteredDeviceTypes = deviceTypes.filter(deviceType =>
        deviceType.name.toLowerCase().includes(search.toLowerCase()) ||
        (deviceType.description && deviceType.description.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="flex flex-col h-screen">
            {/* Tabs tout en haut, padding top léger, largeur réduite */}
            <div className="pt-4 flex justify-center">
                <Tabs defaultValue="account" className="w-full max-w-md">
                    <TabsList className="flex justify-center w-full">
                        <TabsTrigger value="devices" className="w-1/2">Objets connectés</TabsTrigger>
                        <TabsTrigger value="fonctionnality" className="w-1/2">Fonctionnalités</TabsTrigger>
                    </TabsList>

                    <TabsContent value="devices">
                        {/* Largeur du contenu élargie pour les cards, et cards plus larges */}
                        <div className="w-full max-w-7xl mx-auto py-10 px-4">
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
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 gap-8">
                                {filteredDeviceTypes.map((deviceType) => {
                                    const DeviceCardComponent = getDeviceCardComponent(deviceType.name);
                                    return (
                                        <div className="w-full">
                                            <DeviceCardComponent key={deviceType.id} device={deviceType} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="flex flex-col items-center justify-center h-full p-8">
            </div>
        </div>
    )
}

export default DiscoverPage
