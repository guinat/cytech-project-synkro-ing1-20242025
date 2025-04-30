import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Modal d'infos invité (déclaré hors GuestsPage)
const GuestInfoModal = ({ guest, open, onClose }: { guest: any, open: boolean, onClose: () => void }) => {
  if (!open || !guest) return null;
  return (
    <div style={{position: 'fixed', top:0, left:0, width:'100vw', height:'100vh', background:'rgba(0,0,0,0.15)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
      <div style={{background:'#fff', borderRadius:12, padding:24, minWidth:300, minHeight:180, boxShadow:'0 2px 16px #0002', position:'relative'}}>
        <Button onClick={onClose} style={{position:'absolute', top:8, right:12, fontWeight:'bold', fontSize:18, background:'none', border:'none', cursor:'pointer'}} variant="ghost" size="icon">×</Button>
        <h2 style={{fontWeight:600, fontSize:20, marginBottom:12}}>Détails de l'invité</h2>
        <div><b>Nom :</b> {guest.display_name || '(non renseigné)'}</div>
        <div><b>Email :</b> {guest.email}</div>
        <div><b>Rôle :</b> {guest.role || 'VISITOR'}</div>
        {guest.guest_detail && <div><b>Détail :</b> {guest.guest_detail}</div>}
      </div>
    </div>
  );
};
import { useUser } from '@/contexts/UserContext';
import { deleteUserService } from '@/services/user.service';
import { apiFetch } from '@/services/api';
import { Plus, Trash2, Pencil, User as UserIcon, Info } from 'lucide-react';
import InviteGuestModal from '@/components/dashboard/InviteGuestModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
  console.log("guests:", guests);
  const [loading, setLoading] = useState(true);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);

  // Fetch guests
  const fetchGuests = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/users/?is_guest=true');
      console.log('API /users/?is_guest=true response:', data);
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
        <h1 className="text-2xl font-bold">Gérer les membres de la plateforme</h1>
        <div className="flex gap-2">
          <Button
            className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => { setEditGuest(null); setInviteModalOpen(true); }}
            disabled={guests.length >= 10}
          >
            <Plus className="w-5 h-5" />
            Ajouter un compte sur le site
          </Button>
          {/* Bouton accès dashboard admin */}
          <Button
            className="flex items-center gap-2 px-4 py-2 rounded bg-secondary text-primary border border-primary hover:bg-primary hover:text-white transition"
            onClick={() => window.open('http://127.0.0.1:8000/admin', '_blank')}
            type="button"
            variant="outline"
          >
            Accéder au dashboard admin
          </Button>
        </div>
      </div>
      {loading ? (
        <div>Chargement...</div>
      ) : guests.length === 0 ? (
        <div className="text-center text-muted-foreground mt-8">Aucun invité pour le moment.</div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-2 flex-nowrap md:flex-wrap md:overflow-x-visible">
           <GuestInfoModal guest={selectedGuest} open={!!selectedGuest} onClose={() => setSelectedGuest(null)} />
           {guests.length === 0 ? (
             <div className="text-center text-muted-foreground mt-8">Aucun invité pour le moment.</div>
           ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-8">
               {guests.filter(guest => guest.id !== user?.id).map((guest) => (
                 <div key={guest.id} className="relative bg-white rounded-xl shadow p-6 flex flex-col items-center">
                   <Button className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full" title="Supprimer" onClick={() => handleDelete(guest.id)} variant="ghost" size="icon">
                     <Trash2 className="w-4 h-4" />
                   </Button>
                   <Button className="absolute top-2 left-2 p-1 hover:bg-muted rounded-full" title="Infos" onClick={() => setSelectedGuest(guest)} variant="ghost" size="icon">
                     <Info className="w-4 h-4" />
                   </Button>
                   <Avatar className="w-16 h-16 mb-4">
                     <AvatarFallback>{guest.display_name?.[0]?.toUpperCase() || guest.email?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                     {guest.profile_photo && <AvatarImage src={guest.profile_photo} alt={guest.display_name || guest.email} />}
                   </Avatar>
                   <div className="font-semibold text-lg mb-2">{guest.display_name || guest.email}</div>
                   <div className="text-xs text-muted-foreground mb-2">
                     Rôle : <b>{guest.role || 'VISITOR'}</b>
                   </div>
                   <Button className="absolute bottom-2 right-2 p-1 hover:bg-muted rounded-full" title="Modifier" onClick={() => handleEdit(guest)} variant="ghost" size="icon">
                     <Pencil className="w-4 h-4" />
                   </Button>
                 </div>
               ))}
             </div>
           )}
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
