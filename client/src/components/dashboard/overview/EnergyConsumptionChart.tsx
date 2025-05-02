import React from 'react';
import { getEnergyConsumption, EnergyConsumptionParams, EnergyConsumptionResponse } from '@/services/devices.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subDays, subHours, subMinutes, subMonths } from "date-fns";
import { fr } from 'date-fns/locale';
import { RefreshCw, PlayCircle, PauseCircle, Download as DownloadIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toZonedTime, format as formatTz } from 'date-fns-tz';

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

  React.useEffect(() => {
    if (granularity === 'month') {
      setAutoRefresh(false);
    }
  }, [granularity]);
  
  const downloadCSV = () => {
    const headers = ["Période", ...devices.map(d => d.device_name)];
    const rows = data.map(row => [row.period, ...devices.map(d => row[d.device_name] ?? 0)]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "energy_consumption.csv");
  };

  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
    const tableColumn = ["Période", ...devices.map(d => d.device_name)];
    const tableRows = data.map(row => [row.period, ...devices.map(d => (row[d.device_name] ?? 0).toFixed(3))]);

    doc.text("Historique de consommation d'énergie", 40, 30);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      margin: { left: 20, right: 20 },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      theme: "striped",
    });

    doc.save('energy_consumption.pdf');
  };

  const loadData = React.useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
  
    try {
      const now = new Date();
      let dateStart;
  
      switch (granularity) {
        case 'minute': dateStart = subMinutes(now, 10); break;
        case 'hour': dateStart = subHours(now, 10); break;
        case 'day': dateStart = subDays(now, 10); break;
        case 'month': dateStart = subMonths(now, 10); break;
      }
  
      const params: EnergyConsumptionParams = {
        home_id: homeId,
        room_id: roomId,
        device_id: selectedDevice === "all" ? undefined : selectedDevice || deviceId,
        date_start: dateStart.toISOString(),
        date_end: now.toISOString(),
        granularity,
        cumulative: cumulative.toString(),
      };
  
      const res: EnergyConsumptionResponse = await getEnergyConsumption(params);
      const currentHistoricalData = { ...historicalDataRef.current };
  
      if (res.devices?.length) {
        res.devices.forEach(device => {
          if (!currentHistoricalData[device.device_id]) {
            currentHistoricalData[device.device_id] = {};
          }
          Object.entries(device.consumption ?? {}).forEach(([period, value]) => {
            if (value > 0 || !currentHistoricalData[device.device_id][period]) {
              currentHistoricalData[device.device_id][period] = value;
            }
          });
        });
      }

      // Nettoyage des clés incompatibles avec la granularité actuelle
      Object.keys(currentHistoricalData).forEach(deviceId => {
        const cleanedConsumption: Record<string, number> = {};

        Object.entries(currentHistoricalData[deviceId]).forEach(([period, value]) => {
          let isValid = true;

          if (granularity === 'day') {
            isValid = /^\d{4}-\d{2}-\d{2}$/.test(period);
          } else if (granularity === 'hour') {
            isValid = /^\d{4}-\d{2}-\d{2} \d{2}$/.test(period) || 
                      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(period);
          } else if (granularity === 'minute') {
            isValid = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(period);
          } else if (granularity === 'month') {
            isValid = /^\d{4}-\d{2}$/.test(period);
          }

          if (isValid) {
            cleanedConsumption[period] = value;
          }
        });

        currentHistoricalData[deviceId] = cleanedConsumption;
      });
  
      setHistoricalData(currentHistoricalData);
  
      const devicesWithHistory = res.devices?.map(device => {
        const deviceCopy = { ...device };
        if (currentHistoricalData[device.device_id]) {
          deviceCopy.consumption = { ...device.consumption };
          Object.entries(currentHistoricalData[device.device_id]).forEach(([period, value]) => {
            if ((!deviceCopy.consumption[period] || deviceCopy.consumption[period] === 0) && value > 0) {
              deviceCopy.consumption[period] = value;
            }
          });
        }
        return deviceCopy;
      }) || [];
  
      setDevices(devicesWithHistory);
  
      if (devicesWithHistory.length) {
        const allKeys = Array.from(
          new Set(devicesWithHistory.flatMap(d => Object.keys(d.consumption ?? {})))
        ).sort();
  
        // Regroupement des clés selon la granularité
        let groupedKeys: string[] = [];
  
        if (granularity === 'hour') {
          const groupedSet = new Set<string>();
          allKeys.forEach(key => {
            try {
              const date = new Date(key + 'Z');
              const zoned = toZonedTime(date, 'Europe/Paris');
              const hourString = formatTz(zoned, 'yyyy-MM-dd HH');
              groupedSet.add(hourString);
            } catch (e) {
              console.error('Erreur parsing date:', key, e);
            }
          });
          groupedKeys = Array.from(groupedSet).sort();
        } else if (granularity === 'day') {
          const groupedSet = new Set<string>();
          allKeys.forEach(key => {
            try {
              const date = new Date(key + 'Z');
              const zoned = toZonedTime(date, 'Europe/Paris');
              const dayString = formatTz(zoned, 'yyyy-MM-dd');
              groupedSet.add(dayString);
            } catch (e) {
              console.error('Erreur parsing date:', key, e);
            }
          });
          groupedKeys = Array.from(groupedSet).sort();
        } else if (granularity === 'month') {
          const months = [];
          const currentDate = new Date();
          
          for (let i = 0; i < 10; i++) {
            const monthDate = subMonths(currentDate, i);
            const monthKey = format(monthDate, 'yyyy-MM');
            months.unshift(monthKey);
          }
          
          const monthlyData = months.map(monthKey => {
            const entry: any = { 
              period: monthKey,
              displayPeriod: format(new Date(monthKey + '-01'), 'MMM yyyy', { locale: fr })
            };
            
            devicesWithHistory.forEach(device => {
              let total = 0;
              
              Object.entries(device.consumption || {}).forEach(([period, value]) => {
                if (period.startsWith(monthKey)) {
                  total += value;
                }
              });
              
              entry[device.device_name] = total;
            });
            
            return entry;
          });
          
          setData(monthlyData);
        } else {
          groupedKeys = allKeys; // minute
        }

        // Limitation aux 10 dernières périodes
        let limitStartDate: Date | null = null;
        let limitedKeys: string[] = [];

        if (granularity === 'hour') {
          limitStartDate = subHours(now, 9);
          limitedKeys = groupedKeys.filter(key => {
            try {
              const dateKey = new Date(key.replace(' ', 'T') + ':00:00Z');
              const zoned = toZonedTime(dateKey, 'Europe/Paris');
              return zoned >= limitStartDate!;
            } catch (e) {
              console.error('Erreur parsing date key:', key, e);
              return false;
            }
          });
        } else if (granularity === 'day') {
          limitStartDate = subDays(now, 9);
          limitedKeys = groupedKeys.filter(key => {
            try {
              const dateKey = new Date(key + 'T00:00:00Z');
              const zoned = toZonedTime(dateKey, 'Europe/Paris');
              return zoned >= limitStartDate!;
            } catch (e) {
              console.error('Erreur parsing date key:', key, e);
              return false;
            }
          });
        } else {
          limitedKeys = groupedKeys.slice(-10);
        }

        // Construction des données pour le graphique
        if (granularity !== 'month') {
          const chartData = limitedKeys.map(key => {
            const entry: any = { period: key };
            devicesWithHistory.forEach(d => {
              let total = 0;
              
              Object.entries(d.consumption || {}).forEach(([consumptionKey, value]) => {
                try {
                  const date = new Date(consumptionKey + 'Z');
                  const zoned = toZonedTime(date, 'Europe/Paris');
                  let formattedKey;
                  
                  if (granularity === 'hour') {
                    formattedKey = formatTz(zoned, 'yyyy-MM-dd HH');
                  } else if (granularity === 'day') {
                    formattedKey = formatTz(zoned, 'yyyy-MM-dd');
                  } else {
                    formattedKey = consumptionKey;
                  }
                  
                  if (formattedKey === key) {
                    total += value;
                  }
                } catch (e) {
                  console.error('Erreur parsing consumption key:', consumptionKey, e);
                }
              });
              
              entry[d.device_name] = total;
            });
            return entry;
          });

          // Formatage des dates pour l'affichage
          chartData.forEach(entry => {
            try {
              let date: Date | null = null;

              if (granularity === 'hour') {
                date = new Date(entry.period.replace(' ', 'T') + ':00:00Z');
              } else if (granularity === 'day') {
                date = new Date(entry.period + 'T00:00:00Z');
              } else if (granularity === 'minute') {
                date = new Date(entry.period + 'Z');
              }

              if (!date || isNaN(date.getTime())) {
                entry.displayPeriod = entry.period;
                return;
              }

              const zonedDate = toZonedTime(date, 'Europe/Paris');

              entry.displayPeriod =
                granularity === 'minute' ? formatTz(zonedDate, 'HH:mm', { locale: fr }) :
                granularity === 'hour' ? formatTz(zonedDate, 'HH\'h\'', { locale: fr }) :
                granularity === 'day' ? formatTz(zonedDate, 'dd MMM', { locale: fr }) :
                entry.period;

            } catch (error) {
              console.error('Erreur parsing date:', entry.period, error);
              entry.displayPeriod = entry.period;
            }
          });

          setData(chartData);
        }
      } else {
        setData([]);
      }
    } catch (e: any) {
      console.error("Erreur lors du chargement:", e);
      setError(e?.message || 'Erreur');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [homeId, roomId, deviceId, selectedDevice, granularity, cumulative]);
  
  React.useEffect(() => { loadData(); }, [loadData]);
  
  React.useEffect(() => {
    if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    if (autoRefresh) {
      refreshTimerRef.current = setInterval(() => { loadData(); }, refreshIntervals[granularity]);
    }
    return () => { if (refreshTimerRef.current) clearInterval(refreshTimerRef.current); };
  }, [autoRefresh, granularity, loadData]);

  const getDeviceColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
    return colors[index % colors.length];
  };

  const getRefreshLabel = () => {
    const interval = refreshIntervals[granularity];
    if (interval === 60000) return "1 minute";
    if (interval === 3600000) return "1 heure";
    if (interval === 86400000) return "1 jour";
    if (interval === 2592000000) return "30 jours";
    return "Automatique";
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">Consommation d'énergie</CardTitle>
            <CardDescription>
              Analyse des 10 derniers points
              <Badge variant="outline" className="ml-2 text-xs">{autoRefresh ? getRefreshLabel() : "Manuel"}</Badge>
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select onValueChange={(value) => { value === 'csv' ? downloadCSV() : downloadPDF(); }}>
              <SelectTrigger className="h-10 w-48">
                <div className="flex items-center gap-2">
                  <DownloadIcon className="h-5 w-5" />
                  <SelectValue placeholder="Télécharger" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setAutoRefresh(!autoRefresh)} className="h-8">
              {autoRefresh ? <PauseCircle className="h-4 w-4 mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
              {autoRefresh ? "Pause" : "Auto"}
            </Button>
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="h-8">
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
                  dataKey="displayPeriod" 
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