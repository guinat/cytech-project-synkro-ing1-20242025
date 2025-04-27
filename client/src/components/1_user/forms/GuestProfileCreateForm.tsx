import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface GuestProfileCreateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GuestProfileFormData) => Promise<void>;
  loading?: boolean;
}

export interface GuestProfileFormData {
  name: string;
  permission_level: 'VIEW_ONLY' | 'CONTROL' | 'ADD';
}

const GuestProfileCreateForm: React.FC<GuestProfileCreateFormProps> = ({ open, onOpenChange, onSubmit, loading }) => {
  const [name, setName] = useState('');
  const [permission, setPermission] = useState<'VIEW_ONLY' | 'CONTROL' | 'ADD'>('VIEW_ONLY');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Le nom est requis.');
      return;
    }
    try {
      await onSubmit({ name: name.trim(), permission_level: permission });
      setName('');
      setPermission('VIEW_ONLY');
      onOpenChange(false);
    } catch (err: any) {
      setError(err?.message || 'Erreur lors de la création du profil invité.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un profil invité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guest-name" className="block text-sm font-medium mb-1">Nom du profil invité</label>
            <input
              id="guest-name"
              type="text"
              className="w-full p-2 border rounded-md"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Restrictions</label>
            <select
              className="w-full p-2 border rounded-md"
              value={permission}
              onChange={e => setPermission(e.target.value as GuestProfileFormData['permission_level'])}
            >
              <option value="VIEW_ONLY">Voir seulement le catalogue</option>
              <option value="CONTROL">Contrôler les devices</option>
              <option value="ADD">Ajouter des devices</option>
            </select>
          </div>
          {error && <div className="text-destructive text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer'}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GuestProfileCreateForm;
