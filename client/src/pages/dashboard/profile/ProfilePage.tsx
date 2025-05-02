// TODO: Delete some FormField like First Name, Last Name, Gender ...
import React from 'react';
import { useUser } from '@/contexts/UserContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Mail, MoreHorizontal } from 'lucide-react';
import ProfileActionsDropdown from './ProfileActionsDropdown';
import { StatusBadge } from '@/components/ui/status-badge';
import UserEditForm from '@/components/1_user/forms/UserEditForm';



// Fonction utilitaire pour déterminer le niveau selon les points
function getUserLevel(points?: number) {
  const { profile: user, loading } = useUser();
  if(user?.role === "ADMIN") return 'Administrator';
  if (typeof points !== 'number') return '-';
  if (points < 35) return 'beginner';
  if (points < 70) return 'intermediate';
  return 'expert';
}

const ProfilePage: React.FC = () => {
  const { profile: user, loading } = useUser();
  const [editMode, setEditMode] = React.useState(false);
  const [otpStep, setOtpStep] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState('');
  
  const getInitials = () => {
    if (!user) return 'U';
    return user.username?.[0] || 'U';
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="text-lg">Profile not found</span>
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your profile information</CardDescription>
          </div>
          {editMode ? (
            <Button variant="outline" onClick={() => setEditMode(false)}>
              Cancel
            </Button>
          ) : (
            <ProfileActionsDropdown onEdit={() => setEditMode(true)} icon={<MoreHorizontal className="w-5 h-5" />} />
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {editMode ? (
            <div className="py-4">
              <React.Suspense fallback={<div>Loading form...</div>}>
                <UserEditForm 
                  onSuccess={() => setEditMode(false)}
                  otpStep={otpStep}
                  setOtpStep={setOtpStep}
                  otpCode={otpCode}
                  setOtpCode={setOtpCode}
                />
              </React.Suspense>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-muted-foreground">@{user.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                    <div className="flex items-center justify-between mt-1">
                      <p className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                        {user.email}
                      </p>
                      {user.is_email_verified ? (
                        <StatusBadge
                          variant="success"
                          position="inline"
                          className="ml-2"
                          text="Verified"
                        />
                      ) : (
                        <div className="flex items-center">
                          <StatusBadge
                            variant="warning"
                            position="inline"
                            className="ml-2"
                            text="Not verified"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
                    <p className="mt-1 capitalize">{getUserLevel(user?.points)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Points</h3>
                    <p className="mt-1">{user?.points}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Member since</h3>
                    <p className="mt-1">{user?.date_joined}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage; 