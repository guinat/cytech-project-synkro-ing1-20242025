import React, { useState, useEffect } from 'react';
import { deleteUserService } from '@/services/user.service';
import { apiFetch } from '@/services/api';
import { Plus, Trash2, Pencil, User as UserIcon } from 'lucide-react';
import InviteGuestModal from '@/components/dashboard/InviteGuestModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Guest {
  id: string;
  email: string;
  display_name: string;
  role: string;
  guest_detail?: string;
  guest_permissions?: {
    can_view: boolean;
    can_control: boolean;
    can_add: boolean;
  };
  profile_photo?: string | null;
}

const GuestsPage: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  console.log("guests:", guests);
  const [loading, setLoading] = useState(true);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);

  // Fetch guests
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/users/?role=VISITOR');
      console.log('API /users/?role=VISITOR response:', data);
      if (Array.isArray(data)) {
        setGuests(data);
      } else if (Array.isArray(data.results)) {
        setGuests(data.results);
      } else {
        setGuests([]);
      }
    } catch (e) {
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGuests(); }, []);

  // Delete guest
  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet invité ?')) return;
    try {
      await deleteUserService(id);
      fetchGuests();
    } catch (e: any) {
      alert('Erreur lors de la suppression: ' + (e?.message || ''));
    }
  };

  // Edit permissions (open InviteGuestModal in edit mode)
  const handleEdit = (guest: Guest) => {
    setEditGuest(guest);
    setInviteModalOpen(true);
  };

  // When a guest is added/edited, refresh the list
  const handleSuccess = () => {
    setInviteModalOpen(false);
    setEditGuest(null);
    fetchGuests();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invités</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => { setEditGuest(null); setInviteModalOpen(true); }}
          disabled={guests.length >= 10}
        >
          <Plus className="w-5 h-5" />
          Ajouter un invité
        </button>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : guests.length === 0 ? (
        <div className="text-muted-foreground">Aucun invité pour le moment.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 flex-nowrap md:flex-wrap md:overflow-x-visible">
          {guests.filter(g => g.role === 'VISITOR').slice(0, 10).map((guest) => (
            <div key={guest.id} className="relative flex flex-col items-center min-w-[260px] max-w-[300px] bg-card rounded-xl shadow p-4 border border-border mr-2 md:mr-0">
              <button className="absolute top-2 right-2 p-1 hover:bg-destructive/20 rounded-full" title="Supprimer" onClick={() => handleDelete(guest.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
              <Avatar className="h-16 w-16 mb-2">
                {guest.profile_photo ? (
                  <AvatarImage src={guest.profile_photo} alt={guest.display_name} />
                ) : (
                  <AvatarFallback>
                    {guest.display_name?.[0] || guest.email?.[0] || <UserIcon className="w-8 h-8" />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="font-semibold text-center mb-1 truncate w-full">{guest.display_name || guest.email}</div>
              <div className="text-xs text-muted-foreground text-center mb-2 w-full truncate">{guest.guest_detail}</div>

              <button className="absolute bottom-2 right-2 p-1 hover:bg-muted rounded-full" title="Modifier" onClick={() => handleEdit(guest)}>
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
      <InviteGuestModal
        open={inviteModalOpen}
        onOpenChange={(open) => { setInviteModalOpen(open); if (!open) setEditGuest(null); }}
        onSuccess={handleSuccess}
        guestToEdit={editGuest}
      />
    </div>
  );
};

export default GuestsPage;
