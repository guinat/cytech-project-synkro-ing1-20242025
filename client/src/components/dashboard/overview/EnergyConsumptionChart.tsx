import React from 'react';
import { getEnergyConsumption, EnergyConsumptionParams, EnergyConsumptionResponse } from '@/services/devices.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subHours, subMinutes, subMonths } from "date-fns";
import { fr } from 'date-fns/locale';
import { RefreshCw, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface EnergyConsumptionChartProps {
  homeId?: string;
  roomId?: string;
  deviceId?: string;
}

interface DeviceData {
  device_id: string;
  device_name: string;
  consumption: Record<string, number>;
  state?: 'ON' | 'OFF';
}

const granularities = [
  { label: 'Minute', value: 'minute' },
  { label: 'Heure', value: 'hour' },
  { label: 'Jour', value: 'day' },
  { label: 'Mois', value: 'month' },
];

const refreshIntervals = {
  minute: 60000,
  hour: 3600000,
  day: 86400000,
  month: 2592000000, 
};

const EnergyConsumptionChart: React.FC<EnergyConsumptionChartProps> = ({ homeId, roomId, deviceId }) => {
  const [granularity, setGranularity] = React.useState<'minute' | 'hour' | 'day' | 'month'>('minute');
  const [data, setData] = React.useState<any[]>([]);
  const [devices, setDevices] = React.useState<DeviceData[]>([]);
  const [historicalData, setHistoricalData] = React.useState<Record<string, Record<string, number>>>({});
  const [loading, setLoading] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<string>("all");
  const [error, setError] = React.useState<string | null>(null);
  const [cumulative, setCumulative] = React.useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = React.useState<boolean>(true);
  const refreshTimerRef = React.useRef<NodeJS.Timeout | null>(null);
  const historicalDataRef = React.useRef<Record<string, Record<string, number>>>({});

  React.useEffect(() => {
    historicalDataRef.current = historicalData;
  }, [historicalData]);

  const loadData = React.useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const now = new Date();
      let dateStart;
      
      switch (granularity) {
        case 'minute':
          dateStart = subMinutes(now, 10);
          break;
        case 'hour':
          dateStart = subHours(now, 10);
          break;
        case 'day':
          dateStart = subDays(now, 10);
          break;
        case 'month':
          dateStart = subMonths(now, 10);
          break;
      }

      const formattedDateStart = dateStart.toISOString();
      const formattedDateEnd = now.toISOString();

      const params: EnergyConsumptionParams = {
        home_id: homeId,
        room_id: roomId,
        device_id: selectedDevice === "all" ? undefined : selectedDevice || deviceId,
        date_start: formattedDateStart,
        date_end: formattedDateEnd,
        granularity,
        cumulative: cumulative.toString(),
      };
      
      const res: EnergyConsumptionResponse = await getEnergyConsumption(params);
      
      const currentHistoricalData = { ...historicalDataRef.current };
      
      if (res.devices && res.devices.length > 0) {
        res.devices.forEach(device => {
          if (!currentHistoricalData[device.device_id]) {
            currentHistoricalData[device.device_id] = {};
          }
          
          if (device.consumption) {
            Object.keys(device.consumption).forEach(period => {
              if (device.consumption[period] > 0 || !currentHistoricalData[device.device_id][period]) {
                currentHistoricalData[device.device_id][period] = device.consumption[period];
              }
            });
          }
        });
      }
      
      setHistoricalData(currentHistoricalData);
      
      const devicesWithHistory = res.devices?.map(device => {
        const deviceCopy = { ...device };
        
        if (currentHistoricalData[device.device_id]) {
          deviceCopy.consumption = { ...device.consumption };
          
          Object.keys(currentHistoricalData[device.device_id]).forEach(period => {
            if ((!deviceCopy.consumption[period] || deviceCopy.consumption[period] === 0) && 
                currentHistoricalData[device.device_id][period] > 0) {
              deviceCopy.consumption[period] = currentHistoricalData[device.device_id][period];
            }
          });
        }
        
        return deviceCopy;
      }) || [];
      
      setDevices(devicesWithHistory);
      
      if (devicesWithHistory.length > 0) {
        const allKeys = Array.from(
          new Set(devicesWithHistory.flatMap(d => Object.keys(d.consumption || {})))
        ).sort();
        
        const limitedKeys = allKeys.slice(-10);
        
        const chartData = limitedKeys.map(key => {
          const entry: any = { period: key };
          devicesWithHistory.forEach(d => {
            if (d.device_name) {
              entry[d.device_name] = d.consumption?.[key] || 0;
            }
          });
          return entry;
        });
        
        if (granularity === 'minute') {
          chartData.forEach(entry => {
            const date = entry.period;
            if (date && date.includes(' ')) {
              entry.displayPeriod = date.split(' ')[1];
            } else if (date && date.includes('T')) {
              const dateObj = new Date(date);
              entry.displayPeriod = format(dateObj, 'HH:mm');
            } else {
              entry.displayPeriod = date;
            }
          });
        } else if (granularity === 'hour') {
          chartData.forEach(entry => {
            const date = entry.period;
            if (date && date.includes(' ')) {
              entry.displayPeriod = date.split(' ')[1].substring(0, 2) + 'h';
            } else if (date && date.includes('T')) {
              const dateObj = new Date(date);
              entry.displayPeriod = format(dateObj, 'HH') + 'h';
            } else {
              entry.displayPeriod = date;
            }
          });
        } else if (granularity === 'day') {
          chartData.forEach(entry => {
            const date = entry.period;
            if (date && date.includes('T')) {
              const dateObj = new Date(date);
              entry.displayPeriod = format(dateObj, 'dd MMM', { locale: fr });
            } else {
              entry.displayPeriod = date;
            }
          });
        } else if (granularity === 'month') {
          chartData.forEach(entry => {
            const date = entry.period;
            if (date && date.includes('-') && !date.includes('T')) {
              const [year, month] = date.split('-');
              entry.displayPeriod = format(new Date(parseInt(year), parseInt(month) - 1, 1), 'MMM yyyy', { locale: fr });
            } else if (date && date.includes('T')) {
              const dateObj = new Date(date);
              entry.displayPeriod = format(dateObj, 'MMM yyyy', { locale: fr });
            } else {
              entry.displayPeriod = date;
            }
          });
        } else {
          chartData.forEach(entry => {
            entry.displayPeriod = entry.period;
          });
        }
        
        setData(chartData);
      } else {
        setData([]);
      }
    } catch (e: any) {
      console.error("Erreur lors du chargement des données:", e);
      setError(e?.message || 'Erreur lors du chargement');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [homeId, roomId, deviceId, selectedDevice, granularity, cumulative]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);
  React.useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => {
        loadData();
      }, refreshIntervals[granularity]);
    }

    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, granularity, loadData]);

  React.useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  const getDeviceColor = (index: number) => {
    const colors = [
      '#3b82f6', 
      '#10b981', 
      '#ef4444', 
      '#f59e0b', 
      '#8b5cf6', 
      '#ec4899',
      '#06b6d4' 
    ];
    return colors[index % colors.length];
  };

  const getRefreshLabel = () => {
    const interval = refreshIntervals[granularity];
    if (interval === 60000) return "1 minute";
    if (interval === 3600000) return "1 heure";
    if (interval === 86400000) return "1 jour";
    if (interval === 2592000000) return "30 jours";
    return "automatique";
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Consommation d'énergie</CardTitle>
            <CardDescription>
              Analyse des 10 derniers points de consommation
              <Badge variant="outline" className="ml-2 text-xs">
                Rafraîchissement: {autoRefresh ? getRefreshLabel() : "Manuel"}
              </Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setAutoRefresh(!autoRefresh)} 
              className="h-8"
            >
              {autoRefresh ? (
                <PauseCircle className="h-4 w-4 mr-2" />
              ) : (
                <PlayCircle className="h-4 w-4 mr-2" />
              )}
              {autoRefresh ? "Pause" : "Auto"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadData} 
              disabled={loading}
              className="h-8"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Actualiser
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block">Période</label>
            <Select value={granularity} onValueChange={(value) => setGranularity(value as any)}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Sélectionner une période" />
              </SelectTrigger>
              <SelectContent>
                {granularities.map(g => (
                  <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block">Appareil</label>
            <Select value={selectedDevice} onValueChange={setSelectedDevice}>
              <SelectTrigger className="h-8">
                <SelectValue placeholder="Tous les appareils" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les appareils</SelectItem>
                {devices.map(d => (
                  <SelectItem key={d.device_id} value={d.device_id}>{d.device_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 min-w-[120px]">
            <label className="text-xs text-muted-foreground mb-1 block">Mode d'affichage</label>
            <div className="flex items-center space-x-2 mt-1">
              <Switch 
                id="cumulative" 
                checked={cumulative} 
                onCheckedChange={setCumulative}
              />
              <Label htmlFor="cumulative" className="text-xs">
                {cumulative ? "Consommation cumulée" : "Consommation par période"}
              </Label>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="bg-destructive/10 text-destructive p-2 rounded-md text-sm mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="w-full h-[250px] flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-[250px] w-full rounded-md" />
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="w-full h-[250px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible pour la période sélectionnée
          </div>
        ) : (
          <div className="w-full h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis 
                  dataKey={data[0]?.displayPeriod ? "displayPeriod" : "period"} 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis 
                  unit=" kWh" 
                  tick={{ fontSize: 12 }}
                  domain={cumulative ? ['auto', 'auto'] : [0, 'auto']} 
                  label={{ 
                    value: cumulative ? "Consommation cumulée (kWh)" : "Consommation (kWh)", 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px', textAnchor: 'middle' }
                  }} 
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    fontSize: '12px'
                  }} 
                  labelFormatter={(label, items) => {
                    const dataItem = data.find(d => 
                      d.displayPeriod === label || d.period === label
                    );
                    const fullPeriod = dataItem?.period || label;
                    return (
                      <span className="font-medium">
                        {fullPeriod} {cumulative ? " - Consommation cumulée" : " - Consommation"}
                      </span>
                    );
                  }}
                  formatter={(value, name) => {
                    if (typeof value === 'number') {
                      return [`${value.toFixed(3)} kWh`, name];
                    }
                    return [`${value} kWh`, name];
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                {devices.length > 0 ? (
                  devices.map((d, idx) => (
                    <Line 
                      key={d.device_id} 
                      type={cumulative ? "monotone" : "linear"} 
                      dataKey={d.device_name} 
                      stroke={getDeviceColor(idx)} 
                      strokeWidth={2}
                      isAnimationActive={true}
                      dot={{ r: 3, fill: getDeviceColor(idx) }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: getDeviceColor(idx) }}
                    />
                  ))
                ) : (
                  // Default line if no devices are available but we have data
                  <Line 
                    type={cumulative ? "monotone" : "linear"} 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    isAnimationActive={true}
                    dot={{ r: 3, fill: "#3b82f6" }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: "#3b82f6" }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnergyConsumptionChart;
