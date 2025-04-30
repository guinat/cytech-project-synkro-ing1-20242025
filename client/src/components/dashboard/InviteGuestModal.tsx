import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface InviteGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  guestToEdit?: any | null; // type Guest optionnel
}

export const InviteGuestModal: React.FC<InviteGuestModalProps> = ({ open, onOpenChange, onSuccess, guestToEdit }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    password_confirm: '',
    display_name: '',
    guest_detail: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Préremplir si édition d'un invité
  useEffect(() => {
    if (guestToEdit) {
      setForm({
        email: guestToEdit.email || '',
        password: '',
        password_confirm: '',
        display_name: guestToEdit.display_name || '',
        guest_detail: guestToEdit.guest_detail || '',
      });
    } else {
      setForm({
        email: '',
        password: '',
        password_confirm: '',
        display_name: '',
        guest_detail: '',
      });
    }
  }, [guestToEdit, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Plus de handleSwitchChange, droits supprimés

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!guestToEdit && form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      if (guestToEdit) {
        await apiFetch(`/users/${guestToEdit.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({
            display_name: form.display_name,
            guest_detail: form.guest_detail,
          }),
        });
      } else {
        await apiFetch('/users/', {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            username: form.email, // Ajout du champ username obligatoire
            password: form.password,
            password_confirm: form.password_confirm,
            display_name: form.display_name,
            guest_detail: form.guest_detail,
          }),
        });
      }
      setError(null);
      if (onSuccess) onSuccess();
      onOpenChange(false);
    } catch (e: any) {
      // Affiche le message d'erreur détaillé du backend
      setError(e.message + (e.raw ? ' : ' + JSON.stringify(e.raw) : '') || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{guestToEdit ? 'Modifier un compte' : 'Inviter une nouvelle personne'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required autoFocus disabled={!!guestToEdit} />
            </div>
            {!guestToEdit && (
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
            )}
            <div>
              <Label htmlFor="display_name">Nom à afficher</Label>
              <Input id="display_name" name="display_name" value={form.display_name} onChange={handleChange} required />
            </div>
            <div className="mb-2 text-sm text-muted-foreground">
              Nom : <b>{form.display_name?.trim() ? form.display_name : '(non renseigné)'}</b> | Rôle : <b>{guestToEdit?.role || "VISITOR"}</b>
            </div>
            <div>
              <Label htmlFor="guest_detail">Catégorie / Détail</Label>
              <Input id="guest_detail" name="guest_detail" value={form.guest_detail} onChange={handleChange} placeholder="ex: enfant, voisin, cousin..." />
            </div>
            <div className="text-xs text-muted-foreground mb-2">
              Les invités créés auront le droit <b>VISITOR</b> par défaut.
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <DialogFooter>
              <Button type="submit" disabled={loading}>{loading ? 'Envoi...' : guestToEdit ? 'Enregistrer' : 'Inviter'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Deuxième pop-up pour le token */}

    </>
  );
};

export default InviteGuestModal;
