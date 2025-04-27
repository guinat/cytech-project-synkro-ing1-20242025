import React, { useState, useEffect } from 'react';
import { apiFetch } from '@/services/api';
import { Plus, Trash2, Pencil, User as UserIcon } from 'lucide-react';
import InviteGuestModal from '@/components/dashboard/InviteGuestModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Guest {
  id: string;
  email: string;
  display_name: string;
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
  const [loading, setLoading] = useState(true);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);

  // Fetch guests
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Guest[]>('/users/?role=guest');
      setGuests(data);
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
      const res = await fetch(`/api/users/${id}/`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch (e) {
      alert('Erreur lors de la suppression');
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
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
          onClick={() => { setEditGuest(null); setInviteModalOpen(true); }}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {guests.map((guest) => (
            <div key={guest.id} className="flex items-center gap-4 p-4 bg-card rounded shadow">
              <Avatar className="h-12 w-12">
                {guest.profile_photo ? (
                  <AvatarImage src={guest.profile_photo} alt={guest.display_name} />
                ) : (
                  <AvatarFallback>
                    <UserIcon className="w-6 h-6" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1">
                <div className="font-semibold">{guest.display_name || guest.email}</div>
                <div className="text-xs text-muted-foreground">{guest.guest_detail}</div>
                <div className="flex gap-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${guest.guest_permissions?.can_view ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>Lecture</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${guest.guest_permissions?.can_control ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>Contrôle</span>
                  <span className={`px-2 py-0.5 text-xs rounded ${guest.guest_permissions?.can_add ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>Ajout</span>
                </div>
              </div>
              <button className="p-2 hover:bg-muted rounded" title="Modifier" onClick={() => handleEdit(guest)}>
                <Pencil className="w-4 h-4" />
              </button>
              <button className="p-2 hover:bg-destructive/20 rounded" title="Supprimer" onClick={() => handleDelete(guest.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
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
