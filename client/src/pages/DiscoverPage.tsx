import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getPublicDeviceTypes, PublicDeviceType } from '@/services/devices.service';
import { getDeviceCardComponent } from '@/components/5_device/cards';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"

const DiscoverPage = () => {
    const [deviceTypes, setDeviceTypes] = React.useState<PublicDeviceType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('all');

    // Catégories fixes pour le select
    const categoryOptions = [
        { value: 'all', label: 'Tous les types' },
        { value: 'lumiere', label: 'Lumière' },
        { value: 'securite', label: 'Sécurité' },
        { value: 'divertissement', label: 'Divertissement' },
        { value: 'gestion', label: 'Gestion de la maison' },
    ];

    // 
    const categorizedDevices = React.useMemo((): Record<string, PublicDeviceType[]> => ({
        lumiere: deviceTypes.filter(dt => dt.name.toLowerCase().includes('bulb')), // plus souple pour le nom
                                        //dt.name.toLowerCase().includes('bulb') || dt.name.toLowerCase().includes('lamp')
        securite: deviceTypes.filter(dt => dt.name.toLowerCase().includes('camera')), // plus souple
        divertissement: [],
        gestion: deviceTypes.filter(dt => dt.name.toLowerCase().includes('thermostat')),
    }), [deviceTypes]);

    // Filtrage selon la catégorie sélectionnée (pas de bug closure)
    const filteredDeviceTypes = React.useMemo(() => {
        if (selectedType === 'all') {
            return deviceTypes.filter((deviceType: PublicDeviceType) => {
                const matchSearch = deviceType.name.toLowerCase().includes(search.toLowerCase()) ||
                    (deviceType.description && deviceType.description.toLowerCase().includes(search.toLowerCase()));
                return matchSearch;
            });
        }
        if (selectedType in categorizedDevices) {
            return categorizedDevices[selectedType].filter((deviceType: PublicDeviceType) => {
                const matchSearch = deviceType.name.toLowerCase().includes(search.toLowerCase()) ||
                    (deviceType.description && deviceType.description.toLowerCase().includes(search.toLowerCase()));
                return matchSearch;
            });
        }
        return [];
    }, [deviceTypes, selectedType, search]);

    React.useEffect(() => {
        getPublicDeviceTypes()
            .then(setDeviceTypes)
            .catch((e) => setError(e.message || 'Erreur de  chargement'))
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

    return (
        <div className="flex flex-col h-screen">
            <div className="pt-4 flex justify-center">
                <Tabs defaultValue="devices" className="w-full max-w-4xl">
                    <TabsList className="flex justify-center w-full gap-4">
                        <TabsTrigger value="devices" className="w-1/2 text-lg px-8 py-3">Objets connectés</TabsTrigger>
                        <TabsTrigger value="fonctionnality" className="w-1/2 text-lg px-8 py-3">Fonctionnalités</TabsTrigger>
                    </TabsList>

                    <TabsContent value="devices">
                        <div className="w-full max-w-7xl mx-auto py-10 px-4">
                            <div className="flex flex-col md:flex-row justify-center gap-4 mb-8 w-full max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Rechercher un appareil..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="border rounded-md px-4 py-2 w-full max-w-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                {/* Nouveau Select UI pour les catégories */}
                                <Select value={selectedType} onValueChange={setSelectedType}>
                                    <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <SelectValue placeholder="Catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
