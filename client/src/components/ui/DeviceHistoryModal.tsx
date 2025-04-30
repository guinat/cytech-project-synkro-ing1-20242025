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

  async function fetchHistory() {
    setLoading(true);
    setError(null);
    try {
      const cmds = await getDeviceCommand(homeId, roomId, deviceId);
      setCommands(cmds);
    } catch (e) {
      setError("Impossible de récupérer l'historique.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchHistory(); }}>
      <DialogTrigger asChild>
        <button className={triggerClassName}>Historique</button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Historique des commandes</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div>Chargement...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <pre style={{ maxHeight: 400, overflow: 'auto', fontSize: 13, background: '#f6f6f6', padding: 8 }}>
            {commands.length > 0 ? JSON.stringify(commands, null, 2) : 'Aucune commande trouvée.'}
          </pre>
        )}
      </DialogContent>
    </Dialog>
  );
}
