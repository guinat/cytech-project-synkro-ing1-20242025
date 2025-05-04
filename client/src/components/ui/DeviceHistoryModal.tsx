"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

import { getDeviceCommand } from "@/services/devices.service";

interface DeviceHistoryModalProps {
  homeId: string;
  roomId: string;
  deviceId: string;
  triggerClassName?: string;
}

export function DeviceHistoryModal({ homeId, roomId, deviceId, triggerClassName }: DeviceHistoryModalProps) {
  const [commands, setCommands] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  
  // we rename some parameters to make them more readable, for exemple 'trackIndex' to 'Track changed'
  const formatParameterName = (paramName: string): string => {
    const parameterMappings: Record<string, string> = {
      'brightness': 'Brightness',
      'color': 'Light color',
      'temperature': 'Temperature',
      'position': 'Opening level',
      'volume': 'Volume',
      'channel': 'Channel',
      'heat': 'Heat setting',
      'mode': 'Consumption mode',
      'trackIndex': 'Track changed',
      'cycle_selection': 'Cycle selected',
      'spin_speed_control': 'Spin speed control',
    };
    
    return parameterMappings[paramName] || paramName;
  };

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const cmds = await getDeviceCommand(homeId, roomId, deviceId);
      setCommands(cmds);
    } catch (e) {
      setError("Unable to retrieve history.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchHistory(); }}>
      <DialogTrigger asChild>
        <button className={triggerClassName}>History</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Command history :</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <div style={{ maxHeight: 400, overflow: 'auto', fontSize: 14, background: '#f6f6f6', padding: 8 }}>
            {commands.length > 0 ? (
              <ul className="space-y-1">
                {commands.map((cmd, idx) => (
                  Object.entries(cmd.parameters).map(([param, value], j) => {
                    // special case for on_off commands
                    // we display "Switched on" in green or "Switched off" in red instead of "on_off" and the value
                    if (param === 'on_off') {
                      const isOn = value === true || value === 'true';
                      return (
                        <li key={idx + '-' + j} className="flex gap-4 items-center border-b border-gray-200 py-1">
                          <span className="text-xs text-gray-500 min-w-[120px]">
                            {cmd.executed_at || cmd.created_at
                              ? new Date(cmd.executed_at || cmd.created_at).toLocaleString('en-US')
                              : 'Unknown date'}
                          </span>
                          <span className={isOn ? "font-semibold text-green-600" : "font-semibold text-red-600"}>
                            {isOn ? "Switched on" : "Switched off"}
                          </span>
                        </li>
                      );
                    }
                    
                    // normal display for other commands
                    return (
                      <li key={idx + '-' + j} className="flex gap-4 items-center border-b border-gray-200 py-1">
                        <span className="text-xs text-gray-500 min-w-[120px]">
                          {cmd.executed_at || cmd.created_at
                            ? new Date(cmd.executed_at || cmd.created_at).toLocaleString('en-US')
                            : 'Unknown date'}
                        </span>
                        <span className="font-semibold text-blue-700">{formatParameterName(param)}</span>
                        <span className="mx-2 text-gray-400">→</span>
                        <span className="text-black dark:text-white">{String(value)}</span>
                      </li>
                    );
                  })
                ))}
              </ul>
            ) : (
              <div className="text-gray-400">No commands found.</div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
