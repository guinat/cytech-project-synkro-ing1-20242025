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
import FeatureServiceCard from '@/components/dashboard/FeatureServiceCard';

const DiscoverPage = () => {
    const [deviceTypes, setDeviceTypes] = React.useState<PublicDeviceType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('all');
    const [selectedBrand, setSelectedBrand] = React.useState('all');

    // Catégories fixes pour le select
    const categoryOptions = [
        { value: 'all', label: 'Tous les types' },
        { value: 'lumiere', label: 'Lumière' },
        { value: 'securite', label: 'Sécurité' },
        { value: 'divertissement', label: 'Divertissement' },
        { value: 'gestion', label: 'Gestion de la maison' },
    ];

    const brandOptions = [
        { value: 'all', label: 'Toutes les marques' },
        { value: 'Philips', label: 'Philips' },
        { value: 'Apple', label: 'Apple' },
        { value: 'Nest', label: 'Nest' },
        { value: 'Amazon', label: 'Amazon' },
        { value: 'Google', label: 'Google' },
        { value: 'Samsung', label: 'Samsung' },
        { value: 'Bosch', label: 'Bosch' }
    ];

    // 
    const categorizedDevices = React.useMemo((): Record<string, PublicDeviceType[]> => ({
        lumiere: deviceTypes.filter(dt => dt.name.toLowerCase().includes('bulb')), // plus souple pour le nom
                                        //dt.name.toLowerCase().includes('bulb') || dt.name.toLowerCase().includes('lamp')
        securite: deviceTypes.filter(dt => dt.name.toLowerCase().includes('camera')), // plus souple
        divertissement: [],
        gestion: deviceTypes.filter(dt =>
            dt.name.toLowerCase().includes('thermostat') ||
            dt.name.toLowerCase().includes('washing machine') ||
            dt.name.toLowerCase().includes('dish washer')
        ),
    }), [deviceTypes]);

    // Filtrage selon la catégorie ET la marque sélectionnées
    const filteredDeviceTypes = React.useMemo(() => {
        let result: PublicDeviceType[] = [];
        if (selectedType === 'all') {
            result = deviceTypes;
        } else if (selectedType in categorizedDevices) {
            result = categorizedDevices[selectedType];
        }
        if (selectedBrand !== 'all') {
            result = result.filter(dt => dt.brand === selectedBrand);
        }
        return result.filter((deviceType: PublicDeviceType) => {
            const matchSearch = deviceType.name.toLowerCase().includes(search.toLowerCase()) ||
                (deviceType.description && deviceType.description.toLowerCase().includes(search.toLowerCase()));
            return matchSearch;
        });
    }, [deviceTypes, categorizedDevices, selectedType, selectedBrand, search]);

    // --- Données de fonctionnalités/services proposés ---
    const featureServices = [
        {
            title: 'Contrôler ses objets connectés',
            description: 'Prenez le contrôle de tous vos appareils connectés depuis une seule interface intuitive.',
            icon: '🕹️',
            category: 'Gestion',
            taskType: 'Contrôler',
        },
        {
            title: 'Automatiser sa maison',
            description: 'Créez des scénarios pour automatiser l’éclairage, le chauffage, la sécurité et plus encore.',
            icon: '🤖',
            category: 'Automatisation',
            taskType: 'Programmer',
        },
        {
            title: 'Surveiller à distance',
            description: 'Gardez un œil sur votre maison grâce aux caméras et capteurs, même en déplacement.',
            icon: '📹',
            category: 'Sécurité',
            taskType: 'Surveiller',
        },
        {
            title: 'Recevoir des alertes intelligentes',
            description: 'Soyez averti instantanément en cas de détection d’intrusion, de fuite ou d’anomalie.',
            icon: '🔔',
            category: 'Sécurité',
            taskType: 'Être alerté',
        },
        {
            title: 'Optimiser la consommation',
            description: 'Analysez et réduisez votre consommation d’énergie grâce à des rapports détaillés.',
            icon: '⚡',
            category: 'Énergie',
            taskType: 'Analyser',
        },
        {
            title: 'Commander à la voix',
            description: 'Pilotez vos équipements par la voix grâce à l’intégration avec les assistants vocaux.',
            icon: '🎤',
            category: 'Confort',
            taskType: 'Contrôler',
        },
        {
            title: 'Gérer les accès',
            description: 'Ouvrez, fermez et surveillez vos accès à distance pour plus de sécurité.',
            icon: '🚪',
            category: 'Sécurité',
            taskType: 'Gérer',
        },
        {
            title: 'Créer des routines personnalisées',
            description: 'Définissez vos propres routines quotidiennes pour une maison qui s’adapte à vos besoins.',
            icon: '🗓️',
            category: 'Automatisation',
            taskType: 'Programmer',
        },
    ];

    const featureCategories = [
        { value: 'all', label: 'Toutes les catégories' },
        { value: 'Gestion', label: 'Gestion' },
        { value: 'Automatisation', label: 'Automatisation' },
        { value: 'Sécurité', label: 'Sécurité' },
        { value: 'Énergie', label: 'Énergie' },
        { value: 'Confort', label: 'Confort' },
    ];
    const featureTaskTypes = [
        { value: 'all', label: 'Tous les types de tâche' },
        { value: 'Contrôler', label: 'Contrôler' },
        { value: 'Programmer', label: 'Programmer' },
        { value: 'Surveiller', label: 'Surveiller' },
        { value: 'Être alerté', label: 'Être alerté' },
        { value: 'Analyser', label: 'Analyser' },
        { value: 'Gérer', label: 'Gérer' },
    ];
    const [selectedFeatureCategory, setSelectedFeatureCategory] = React.useState('all');
    const [selectedFeatureTaskType, setSelectedFeatureTaskType] = React.useState('all');
    const [featureServiceSearch, setFeatureServiceSearch] = React.useState('');

    const filteredFeatureServices = React.useMemo(() => {
        return featureServices.filter(fs => {
            const matchCategory = selectedFeatureCategory === 'all' || fs.category === selectedFeatureCategory;
            const matchTask = selectedFeatureTaskType === 'all' || fs.taskType === selectedFeatureTaskType;
            const matchSearch =
                fs.title.toLowerCase().includes(featureServiceSearch.toLowerCase()) ||
                fs.description.toLowerCase().includes(featureServiceSearch.toLowerCase());
            return matchCategory && matchTask && matchSearch;
        });
    }, [selectedFeatureCategory, selectedFeatureTaskType, featureServiceSearch]);

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
                                {/* Select pour la marque */}
                                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                    <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <SelectValue placeholder="Marque" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {brandOptions.map(opt => (
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

                    <TabsContent value="fonctionnality">
                        <div className="w-full max-w-7xl mx-auto py-10 px-4">
                            <div className="flex flex-col md:flex-row justify-center gap-4 mb-8 w-full max-w-3xl mx-auto">
                                <input
                                    type="text"
                                    placeholder="Rechercher une fonctionnalité ou un service..."
                                    value={featureServiceSearch}
                                    onChange={e => setFeatureServiceSearch(e.target.value)}
                                    className="border rounded-md px-4 py-2 w-full max-w-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <Select value={selectedFeatureCategory} onValueChange={setSelectedFeatureCategory}>
                                    <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <SelectValue placeholder="Catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {featureCategories.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={selectedFeatureTaskType} onValueChange={setSelectedFeatureTaskType}>
                                    <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                        <SelectValue placeholder="Type de tâche" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {featureTaskTypes.map(opt => (
                                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredFeatureServices.map((fs, idx) => (
                                    <FeatureServiceCard
                                        key={fs.title + idx}
                                        title={fs.title}
                                        description={fs.description}
                                        icon={fs.icon}
                                        category={fs.category}
                                        taskType={fs.taskType}
                                    />
                                ))}
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
