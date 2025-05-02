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
import { motion } from "framer-motion";

const DiscoverPage = () => {
    const [deviceTypes, setDeviceTypes] = React.useState<PublicDeviceType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState('');
    const [selectedType, setSelectedType] = React.useState('all');
    const [selectedBrand, setSelectedBrand] = React.useState('all');

    // Fixed categories for select
    const categoryOptions = [
        { value: 'all', label: 'All types' },
        { value: 'lumiere', label: 'Lighting' },
        { value: 'securite', label: 'Security' },
        { value: 'divertissement', label: 'Entertainment' },
        { value: 'gestion', label: 'Home management' },
    ];

    const brandOptions = [
        { value: 'all', label: 'All brands' },
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
        securite: deviceTypes.filter(dt => dt.name.toLowerCase().includes('camera')
                                || dt.name.toLowerCase().includes('doorlocker')
            ), // plus souple
        divertissement: deviceTypes.filter(dt =>
            dt.name.toLowerCase().includes('speaker') ||
            dt.name.toLowerCase().includes('television')
        ),
        gestion: deviceTypes.filter(dt =>
            dt.name.toLowerCase().includes('thermostat') ||
            dt.name.toLowerCase().includes('washing machine') ||
            dt.name.toLowerCase().includes('shutter') ||
            dt.name.toLowerCase().includes('fridge') ||
            dt.name.toLowerCase().includes('oven') ||
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

    // --- Proposed features/services data ---
    const featureServices = [
        {
            title: 'Control your smart devices',
            description: 'Take control of all your connected devices from a single intuitive interface.',
            icon: '🕹️',
            category: 'Management',
            taskType: 'Control',
        },
        {
            title: 'Schedule routines',
            description: 'Automate your daily tasks with personalized routines.',
            icon: '⏰',
            category: 'Management',
            taskType: 'Automate',
        },
        {
            title: 'Optimize consumption',
            description: 'Reduce your energy consumption with our intelligent algorithms.',
            icon: '💡',
            category: 'Management',
            taskType: 'Optimize',
        },
        {
            title: 'Secure your home',
            description: 'Monitor and protect your home remotely with real-time alerts.',
            icon: '🔒',
            category: 'Security',
            taskType: 'Secure',
        },
        {
            title: 'Analyze your data',
            description: 'Visualize and analyze your consumption data with detailed charts.',
            icon: '📊',
            category: 'Management',
            taskType: 'Analyze',
        },
        {
            title: 'Share access',
            description: 'Share access to your smart home with your loved ones.',
            icon: '👨‍👩‍👧‍👦',
            category: 'Management',
            taskType: 'Share',
        },
        {
            title: 'Automate your home',
            description: 'Create scenarios to automate lighting, heating, security and more.',
            icon: '🤖',
            category: 'Automation',
            taskType: 'Program',
        },
        {
            title: 'Monitor remotely',
            description: 'Keep an eye on your home with cameras and sensors, even when you’re away.',
            icon: '📹',
            category: 'Security',
            taskType: 'Monitor',
        },
        {
            title: 'Receive smart alerts',
            description: 'Be instantly notified in case of intrusion, leak or anomaly detection.',
            icon: '🔔',
            category: 'Security',
            taskType: 'Be alerted',
        },
        {
            title: 'Command with your voice',
            description: 'Control your devices with your voice thanks to integration with voice assistants.',
            icon: '🎤',
            category: 'Convenience',
            taskType: 'Control',
        },
        {
            title: 'Manage access',
            description: 'Open, close and monitor your accesses remotely for more security.',
            icon: '🚪',
            category: 'Security',
            taskType: 'Manage',
        },
        {
            title: 'Create custom routines',
            description: 'Define your own daily routines for a home that adapts to your needs.',
            icon: '🗓️',
            category: 'Automation',
            taskType: 'Program',
        },
    ];

    const featureCategories = [
        { value: 'all', label: 'All categories' },
        { value: 'Management', label: 'Management' },
        { value: 'Automation', label: 'Automation' },
        { value: 'Security', label: 'Security' },
        { value: 'Energy', label: 'Energy' },
        { value: 'Convenience', label: 'Convenience' },
    ];
    const featureTaskTypes = [
        { value: 'all', label: 'All task types' },
        { value: 'Control', label: 'Control' },
        { value: 'Automate', label: 'Automate' },
        { value: 'Monitor', label: 'Monitor' },
        { value: 'Secure', label: 'Secure' },
        { value: 'Analyze', label: 'Analyze' },
        { value: 'Share', label: 'Share' },
        { value: 'Program', label: 'Program' },
        { value: 'Be alerted', label: 'Be alerted' },
        { value: 'Manage', label: 'Manage' },
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
            .catch((e) => setError(e.message || 'Loading error'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-lg">Loading catalog...</div>
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

    const cardBase = "bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent transition-all duration-300 cursor-pointer";
    const cardHover = "hover:scale-105 hover:border-violet-500 hover:shadow-2xl hover:z-10";

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-violet-50 pb-24">
            <div className="max-w-5xl mx-auto px-4 py-12">
                <h1 className="text-4xl font-extrabold text-black-700 mb-8 text-center drop-shadow">Discover the devices we offer</h1>
                <div className="flex flex-col h-screen">
                    <div className="pt-4 flex justify-center">
                        <Tabs defaultValue="devices" className="w-full max-w-4xl">
                            <TabsList className="flex justify-center w-full gap-4">
                                <TabsTrigger value="devices" className="w-1/2 text-lg px-8 py-3">Connected devices</TabsTrigger>
                                <TabsTrigger value="fonctionnality" className="w-1/2 text-lg px-8 py-3">Features</TabsTrigger>
                            </TabsList>

                            <TabsContent value="devices">
                                <div className="w-full max-w-7xl mx-auto py-10 px-4">
                                    <div className="flex flex-col md:flex-row justify-center gap-4 mb-8 w-full max-w-3xl mx-auto">
                                        <input
                                            type="text"
                                            placeholder="Search for a device..."
                                            value={search}
                                            onChange={e => setSearch(e.target.value)}
                                            className="border rounded-md px-4 py-2 w-full max-w-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        {/* New Select UI for categories */}
                                        <Select value={selectedType} onValueChange={setSelectedType}>
                                            <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categoryOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {/* Select for brand */}
                                        <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                            <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                                <SelectValue placeholder="Brand" />
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
                                                <motion.div
                                                    key={deviceType.id}
                                                    className={`${cardBase} ${cardHover}`}
                                                    whileHover={{ scale: 1.10, boxShadow: "0 8px 32px 0 rgba(124,58,237,0.15)", borderColor: "#a78bfa" }}
                                                    transition={{ type: "spring", stiffness: 330, damping: 18 }}
                                                >
                                                    <DeviceCardComponent device={deviceType} />
                                                </motion.div>
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
                                            placeholder="Search for a feature or service..."
                                            value={featureServiceSearch}
                                            onChange={e => setFeatureServiceSearch(e.target.value)}
                                            className="border rounded-md px-4 py-2 w-full max-w-md text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                        <Select value={selectedFeatureCategory} onValueChange={setSelectedFeatureCategory}>
                                            <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {featureCategories.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedFeatureTaskType} onValueChange={setSelectedFeatureTaskType}>
                                            <SelectTrigger className="w-full max-w-xs border rounded-md px-4 py-2 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent">
                                                <SelectValue placeholder="Task type" />
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
            </div>
        </div>
    )
}

export default DiscoverPage
