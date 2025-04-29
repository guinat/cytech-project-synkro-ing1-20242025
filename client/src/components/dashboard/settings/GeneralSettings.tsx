import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home } from '@/services/homes.service';
import { toast } from 'sonner';
import { HomeDeleteForm } from '@/components/3_home/forms/HomeDeleteForm';
import { Separator } from '@/components/ui/separator';

interface GeneralSettingsProps {
  home: Home;
  onRename: (name: string) => Promise<void>;
  onDelete: () => Promise<void>;
}
const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  home,
  onRename,
  onDelete,
}) => {
  const [name, setName] = useState(home.name);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name === home.name) return;

    setIsLoading(true);
    setError(null);
    try {
      await onRename(name);
      toast.success('Home name updated');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      toast.error('Failed to update home name');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>
            Manage the general information of your home
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRename} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="home-name">Home name</Label>
              <Input
                id="home-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Home name"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading || name === home.name}>
              {isLoading ? 'Updating...' : 'Update name'}
            </Button>
          </form>

          <Separator className="my-4" />
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            These actions are irreversible. Be careful.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            The deletion of this home will also delete all the rooms, devices and invitations associated with it.
          </p>
          <HomeDeleteForm
            onSubmit={async () => {
              setIsLoading(true);
              try {
                await onDelete();
                toast.success('Home deleted successfully');
              } catch (err: any) {
                toast.error('Failed to delete home');
                setError(err.message || 'An error occurred');
              } finally {
                setIsLoading(false);
              }
            }}
            loading={isLoading}
            error={error}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSettings; 