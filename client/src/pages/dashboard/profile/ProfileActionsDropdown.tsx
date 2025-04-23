import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MoreVertical, User2, Trash2 } from 'lucide-react';
import { deleteMe } from '@/services/user.service';
import { UserDeleteForm } from '@/components/1_user/forms/UserDeleteForm';
interface ProfileActionsDropdownProps {
  onEdit?: () => void;
  icon?: React.ReactNode;
}

const ProfileActionsDropdown: React.FC<ProfileActionsDropdownProps> = ({ onEdit, icon }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setDeleteError(null);
    try {
      await deleteMe();
      setConfirmOpen(false);
      window.location.replace('/auth/sign_in');
    } catch (e: any) {
      setDeleteError(e?.message || 'Erreur lors de la suppression.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Actions profil">
            {icon || <MoreVertical className="w-5 h-5" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>
            <User2 className="mr-2 w-4 h-4" />
            Edit profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="mr-2 w-4 h-4" />
            Delete profile
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete profile</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your profile? This action is irreversible.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)} disabled={loading}>Cancel</Button>
            <UserDeleteForm
              onSubmit={handleDelete}
              loading={loading}
              error={deleteError}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileActionsDropdown;
