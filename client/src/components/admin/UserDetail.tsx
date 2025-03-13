import React, { useState, useEffect } from 'react';
import { User } from '@/services/auth.service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import adminService, { UserUpdateRequest } from '@/services/admin.service';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserDetailProps {
  user: User | null;
  onUserUpdated: () => void;
  onClose: () => void;
}

// Define level thresholds
const LEVEL_THRESHOLDS = {
  beginner: { min: 0, max: 99 },
  intermediate: { min: 100, max: 499 },
  advanced: { min: 500, max: 999 },
  expert: { min: 1000, max: Infinity }
};

// Get level from points
const getLevelFromPoints = (points: number): string => {
  if (points <= LEVEL_THRESHOLDS.beginner.max) return 'beginner';
  if (points <= LEVEL_THRESHOLDS.intermediate.max) return 'intermediate';
  if (points <= LEVEL_THRESHOLDS.advanced.max) return 'advanced';
  return 'expert';
};

// Get default points for a level (middle of the range)
const getDefaultPointsForLevel = (level: string): number => {
  switch (level) {
    case 'beginner': return 50;
    case 'intermediate': return 300;
    case 'advanced': return 750;
    case 'expert': return 1500;
    default: return 0;
  }
};

const levelNames: Record<string, string> = {
  'beginner': 'Beginner',
  'intermediate': 'Intermediate',
  'advanced': 'Advanced',
  'expert': 'Expert'
};

const UserDetail: React.FC<UserDetailProps> = ({ user, onUserUpdated, onClose }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<UserUpdateRequest>({
    username: '',
    email: '',
    role: 'user',
    level: '',
    points: 0,
    is_active: true,
    email_verified: false,
  });
  const [originalData, setOriginalData] = useState<UserUpdateRequest>({});
  const [fieldChanged, setFieldChanged] = useState<{ points: boolean, level: boolean }>({
    points: false,
    level: false
  });

  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        points: user.points,
        is_active: true,
        email_verified: user.email_verified,
      };
      setFormData(userData);
      setOriginalData(userData);
      setFieldChanged({ points: false, level: false });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    let newValue: any = value;
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      newValue = parseInt(value, 10);
    }
    
    // Create updated form data
    const updatedFormData = {
      ...formData,
      [name]: newValue
    };
    
    // Handle special cases for points and level
    if (name === 'points') {
      const points = parseInt(value, 10);
      const newLevel = getLevelFromPoints(points);
      
      // Only update level if points changed by user
      if (newLevel !== formData.level) {
        updatedFormData.level = newLevel;
      }
      
      setFieldChanged(prev => ({ ...prev, points: true }));
    } 
    else if (name === 'level') {
      // If level was changed and points weren't manually changed, update points to default for level
      if (!fieldChanged.points || (originalData.points === formData.points)) {
        updatedFormData.points = getDefaultPointsForLevel(value as string);
      } 
      // If both were changed, level takes precedence
      else if (fieldChanged.points && formData.points !== undefined && getLevelFromPoints(formData.points) !== value) {
        updatedFormData.points = getDefaultPointsForLevel(value as string);
        toast.info("The level has been changed, points have been adjusted accordingly.");
      }
      
      setFieldChanged(prev => ({ ...prev, level: true }));
    }
    
    setFormData(updatedFormData);
  };

  const handleSwitchChange = (checked: boolean, name: string) => {
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation to ensure points and level are consistent
    const finalFormData = { ...formData };
    if (finalFormData.points !== undefined && finalFormData.level) {
      const currentLevel = getLevelFromPoints(finalFormData.points);
      
      if (currentLevel !== finalFormData.level) {
        // Level takes precedence in case of conflict
        finalFormData.points = getDefaultPointsForLevel(finalFormData.level);
        toast.info("The level and points have been adjusted to be consistent.");
      }
    }
    
    try {
      if (!user) return;
      
      setIsLoading(true);
      await adminService.updateUser(user.id, finalFormData);
      toast.success('User updated successfully');
      onUserUpdated();
      setIsEditing(false);
    } catch (error) {
      toast.error('Error updating user: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Select a user to view details
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">{isEditing ? 'Edit User' : 'User Details'}</CardTitle>
            <CardDescription>
              {isEditing 
                ? 'Edit user information below'
                : `Detailed information for ${user.username}`}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            {!isEditing && (
              <>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Close
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="level">Level</Label>
                <select
                  id="level"
                  name="level"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={formData.level}
                  onChange={handleChange}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="points">Points</Label>
                <Input
                  id="points"
                  name="points"
                  type="number"
                  value={formData.points}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="pt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="email_verified"
                    checked={formData.email_verified}
                    onCheckedChange={(checked) => handleSwitchChange(checked, 'email_verified')}
                  />
                  <Label htmlFor="email_verified">Email verified</Label>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="text-2xl">{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{user.username}</h3>
                <p className="text-gray-500">{user.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </Badge>
                  <Badge variant="secondary">
                    {levelNames[user.level] || user.level}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">ID</p>
                <p className="font-medium">{user.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Points</p>
                <p className="font-medium">{user.points}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Email verified</p>
                <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                  {user.email_verified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Registration date</p>
                <p className="font-medium">{new Date(user.date_joined).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Last login</p>
                <p className="font-medium">
                  {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-4 mt-4">
              <h4 className="font-medium mb-2">Raw JSON data:</h4>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
      {isEditing && (
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setIsEditing(false);
              // Reset form data
              if (user) {
                setFormData({
                  username: user.username,
                  email: user.email,
                  role: user.role,
                  level: user.level,
                  points: user.points,
                  is_active: true,
                  email_verified: user.email_verified,
                });
              }
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserDetail; 