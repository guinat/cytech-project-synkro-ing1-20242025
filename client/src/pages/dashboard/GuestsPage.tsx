import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import InviteGuestModal from '@/components/dashboard/InviteGuestModal';

const GuestsPage: React.FC = () => {
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  // TODO: fetch guests and update on invite

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Invités</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
          onClick={() => setInviteModalOpen(true)}
        >
          <Plus className="w-5 h-5" />
          Ajouter un invité
        </button>
      </div>
      {/* Liste des invités à venir ici */}
      <div className="text-muted-foreground">Aucun invité pour le moment.</div>
      <InviteGuestModal open={inviteModalOpen} onOpenChange={setInviteModalOpen} onSuccess={() => {/* TODO: refresh guests */}} />
    </div>
  );
};

export default GuestsPage;
