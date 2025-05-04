import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
import { deleteUserService } from '@/services/user.service';
import { apiFetch } from '@/services/api';
import { Plus, Trash2, Pencil, Info } from 'lucide-react';
import InviteGuestModal from '@/components/dashboard/InviteGuestModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// GuestInfoModal component
const GuestInfoModal = ({ guest, open, onClose }: { guest: any, open: boolean, onClose: () => void }) => {
  if (!open || !guest) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center transition-all">
      <div className="bg-white dark:bg-gray-900 dark:text-white rounded-lg p-6 min-w-[300px] min-h-[180px] shadow-2xl relative">
        <Button
          onClick={onClose}
          className="absolute top-2 right-3 font-bold text-lg text-black/80 dark:text-white hover:text-black dark:hover:text-gray-300"
          variant="ghost"
          size="icon"
        >
          ×
        </Button>
        <h2 className="font-semibold text-xl mb-4">Guest details</h2>
        <div><b>Name:</b> {guest.username || '(not provided)'}</div>
        <div><b>Email:</b> {guest.email}</div>
        <div><b>Role:</b> {guest.role || 'VISITOR'}</div>
        <div><b>Points:</b> {guest.points || '(not provided)'}</div>
        {guest.guest_detail && <div><b>Detail:</b> {guest.guest_detail}</div>}
      </div>
    </div>
  );
};

interface Guest {
  id: string;
  email: string;
  display_name: string;
  role: string;
  is_guest: boolean;
  guest_detail?: string;
  guest_permissions?: {
    can_view: boolean;
    can_control: boolean;
    can_add: boolean;
  };
  profile_photo?: string | null;
  invited_by?: string | null;
}

const GuestsPage: React.FC = () => {
  const [selectedGuest, setSelectedGuest] = useState<any | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [guests, setGuests] = useState<Guest[]>([]);
  const { profile: user } = useUser();
  const [loading, setLoading] = useState(true);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/users/?is_guest=true');
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

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this guest?')) return;
    try {
      await deleteUserService(id);
      fetchGuests();
    } catch (e: any) {
      alert('Error deleting guest: ' + (e?.message || ''));
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditGuest(guest);
    setInviteModalOpen(true);
  };

  const handleSuccess = () => {
    setInviteModalOpen(false);
    setEditGuest(null);
    fetchGuests();
  };

  return (
    <div className="p-6 dark:bg-gray-900 dark:text-white min-h-screen transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Manage platform members</h1>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition dark:bg-blue-600 dark:hover:bg-blue-500"
            onClick={() => { setEditGuest(null); setInviteModalOpen(true); }}
            disabled={guests.length >= 4}
          >
            <Plus className="w-5 h-5" />
            Add an account to the site
          </Button>
          <Button
            className="flex items-center gap-2 px-4 py-2 rounded bg-secondary text-primary border border-primary hover:bg-primary hover:text-white transition dark:bg-gray-800 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
            onClick={() => window.open('http://127.0.0.1:8000/admin', '_blank')}
            type="button"
            variant="outline"
          >
            Go to admin dashboard
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-300">Loading...</div>
      ) : guests.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">No guests at the moment.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 flex-nowrap md:flex-wrap md:overflow-x-visible">
          <GuestInfoModal guest={selectedGuest} open={!!selectedGuest} onClose={() => setSelectedGuest(null)} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8 w-full">
            {guests.filter(guest => guest.id !== user?.id).map((guest) => (
              <div
                key={guest.id}
                className="relative bg-white dark:bg-gray-800 dark:text-white rounded-xl shadow-md dark:shadow-lg p-6 flex flex-col items-center transition-colors"
              >
                <Button
                  className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-black/80 rounded-full text-primary/50 dark:text-gray-300"
                  title="Delete"
                  onClick={() => handleDelete(guest.id)}
                  variant="ghost"
                  size="icon"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button
                  className="absolute top-2 left-2 p-1 hover:bg-gray-100 dark:hover:bg-black/80 rounded-full text-primary/50 dark:text-gray-300"
                  title="Info"
                  onClick={() => setSelectedGuest(guest)}
                  variant="ghost"
                  size="icon"
                >
                  <Info className="w-4 h-4" />
                </Button>
                <Avatar className="w-16 h-16 mb-4">
                  <AvatarFallback className="bg-gray-200 text-black dark:bg-primary/50 dark:text-white">
                    {guest.display_name?.[0]?.toUpperCase() || guest.email?.[0]?.toUpperCase() || '?'}
                  </AvatarFallback>
                  {guest.profile_photo && <AvatarImage src={guest.profile_photo} alt={guest.display_name || guest.email} />}
                </Avatar>
                <div className="font-semibold text-lg mb-2">{guest.display_name || guest.email}</div>
                <div className="text-xs text-gray-500 dark:text-gray-300 mb-2">
                  Role: <b>{guest.role || 'VISITOR'}</b>
                </div>
                <Button
                  className="absolute bottom-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-black/80 rounded-full text-primary/50 dark:text-gray-300"
                  title="Edit"
                  onClick={() => handleEdit(guest)}
                  variant="ghost"
                  size="icon"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <InviteGuestModal
        open={inviteModalOpen}
        onOpenChange={(open) => {
          setInviteModalOpen(open);
          if (!open) setEditGuest(null);
        }}
        onSuccess={handleSuccess}
        guestToEdit={editGuest}
      />
    </div>
  );
};

export default GuestsPage;
