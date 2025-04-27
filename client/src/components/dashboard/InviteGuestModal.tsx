import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface InviteGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const InviteGuestModal: React.FC<InviteGuestModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    display_name: '',
    guest_detail: '',
    can_view: true,
    can_control: false,
    can_add: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSwitchChange = (name: string, value: boolean) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          password_confirm: form.password_confirm,
          display_name: form.display_name,
          guest_detail: form.guest_detail,
          guest_permissions: {
            can_view: form.can_view,
            can_control: form.can_control,
            can_add: form.can_add,
          },
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Erreur lors de la création de l\'invité.');
        setLoading(false);
        return;
      }
      setLoading(false);
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError('Erreur réseau.');
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Inviter un nouvel invité</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required autoFocus />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <div className="flex-1">
              <Label htmlFor="password_confirm">Confirmation</Label>
              <Input id="password_confirm" name="password_confirm" type="password" value={form.password_confirm} onChange={handleChange} required />
            </div>
          </div>
          <div>
            <Label htmlFor="display_name">Nom à afficher</Label>
            <Input id="display_name" name="display_name" value={form.display_name} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="guest_detail">Catégorie / Détail</Label>
            <Input id="guest_detail" name="guest_detail" value={form.guest_detail} onChange={handleChange} placeholder="ex: enfant, voisin, cousin..." />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.can_view} onCheckedChange={v => handleSwitchChange('can_view', v)} />
              <Label>Peut voir</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.can_control} onCheckedChange={v => handleSwitchChange('can_control', v)} />
              <Label>Peut contrôler</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.can_add} onCheckedChange={v => handleSwitchChange('can_add', v)} />
              <Label>Peut ajouter</Label>
            </div>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : 'Inviter'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InviteGuestModal;
