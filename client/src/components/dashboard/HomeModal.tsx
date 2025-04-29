import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Home } from '@/services/homes.service';
import GeneralTab from '@/components/dashboard/HomeModalGeneralTab';
import { HomeDeleteForm } from '@/components/3_home/forms/HomeDeleteForm';
import { Badge } from '@/components/ui/badge';

interface HomeModalProps {
  open: boolean;
  onClose: () => void;
  home: Home;
  onRename?: (name: string) => Promise<void>;
  onColorChange?: (color: string) => Promise<void>;
  onDelete?: () => Promise<void>;
  onInvite?: (email: string, homeId: string) => Promise<void>;
}

const HomeModal: React.FC<HomeModalProps> = ({ open, onClose, home, onRename, onColorChange, onDelete, onInvite }) => {
  const [tab, setTab] = useState<'general' | 'members'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Adapt onColorChange to expected signature for GeneralTab
  const handleColorChange = onColorChange
    ? async (data: { color: string }) => {
        await onColorChange(data.color);
      }
    : async () => {};

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{home.name}</DialogTitle>
          <DialogDescription>
            Gérer les informations de cette maison.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4 mb-4">
          <Button type="button" variant={tab === 'general' ? 'default' : 'outline'} onClick={() => setTab('general')} size="sm">Général</Button>
          <Button type="button" variant={tab === 'members' ? 'default' : 'outline'} onClick={() => setTab('members')} size="sm">Membres</Button>
        </div>
        {tab === 'general' && (
          <GeneralTab
            currentName={home.name}
            currentColor={home.color || '#D1D5DB'}
            loading={loading}
            error={error}
            onRename={onRename ? onRename : async () => {}}
            onColorChange={handleColorChange}
          />
        )}
        {tab === 'members' && (
          <div>
            {/* Invitation */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem("email") as HTMLInputElement).value;
                if (onInvite) await onInvite(email, home.id);
                e.currentTarget.reset();
              }}
              className="flex gap-2 mb-4"
              autoComplete="off"
            >
              <input
                name="email"
                type="email"
                placeholder="name@example.com"
                className="border rounded px-2 py-1 flex-1"
                required
              />
              <Button type="submit">Inviter</Button>
            </form>
            {/* Liste des membres */}
            <div>
              <label className="block mb-1 text-sm font-medium">Membres actuels</label>
              <ul>
                {(home.members && home.members.length > 0) ? (
                  home.members.map((member: any) => (
                    <li key={member.id} className="flex gap-2 items-center">
                      <span>{member.username}</span>
                      {member.is_owner && <Badge variant="outline">owner</Badge>}
                    </li>
                  ))
                ) : (
                  <li className="text-muted">Aucun membre</li>
                )}
              </ul>
            </div>
          </div>
        )}
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Fermer</Button>
          </DialogClose>
          {home.permissions?.can_delete && (
            <HomeDeleteForm
              onSubmit={async () => {
                if (!onDelete) return;
                setLoading(true);
                setError(null);
                try {
                  await onDelete();
                  onClose();
                } catch (e: any) {
                  setError(e.message);
                } finally {
                  setLoading(false);
                }
              }}
              loading={loading}
              error={error}
            />
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HomeModal;