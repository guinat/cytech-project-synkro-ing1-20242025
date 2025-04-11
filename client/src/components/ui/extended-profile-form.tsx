import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import authService, { UserProfileData } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

interface ExtendedProfileFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function ExtendedProfileForm({ className, onSuccess }: ExtendedProfileFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [profileData, setProfileData] = useState<UserProfileData>({
    interests: [],
    skills: [],
    education: '',
    occupation: '',
    social_links: {
      linkedin: '',
      twitter: '',
      github: '',
      website: '',
    },
    date_of_birth: '',
    notification_settings: {
      daily_summary: false,
      weekly_report: false,
      device_alerts: false,
      security_alerts: false,
    },
  });

  // Charger les données du profil étendu
  useEffect(() => {
    const loadExtendedProfile = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getExtendedProfile();
        if (data) {
          setProfileData(prevData => ({
            ...prevData,
            ...data
          }));
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil étendu:', error);
        toast.error('Erreur lors du chargement des informations de profil');
      } finally {
        setIsLoading(false);
      }
    };

    loadExtendedProfile();
  }, []);

  // Gérer les changements de champs de texte
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Gérer les champs imbriqués
    if (name.includes('.')) {
      const [parentField, childField] = name.split('.');
      setProfileData(prevData => ({
        ...prevData,
        [parentField]: {
          ...(prevData[parentField as keyof UserProfileData] as Record<string, any> || {}),
          [childField]: value
        }
      }));
    } else {
      setProfileData(prevData => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  // Gérer les changements pour les champs de type array (intérêts, compétences)
  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'interests' | 'skills') => {
    const { value } = e.target;
    const items = value.split(',').map(item => item.trim()).filter(Boolean);
    
    setProfileData(prevData => ({
      ...prevData,
      [field]: items
    }));
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error('Veuillez entrer votre mot de passe actuel pour confirmer les modifications');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Ajouter le mot de passe pour la vérification
      const dataToSubmit = {
        ...profileData,
        current_password: currentPassword
      };
      
      const response = await authService.updateExtendedProfile(dataToSubmit);
      
      toast.success('Profil mis à jour avec succès');
      setCurrentPassword('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Informations complémentaires</CardTitle>
        <CardDescription>
          Complétez votre profil avec des informations supplémentaires pour améliorer votre expérience
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="interests">Centres d'intérêt</Label>
              <Input
                id="interests"
                placeholder="Domotique, IoT, Programmation..."
                value={profileData.interests?.join(', ')}
                onChange={(e) => handleArrayChange(e, 'interests')}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les centres d'intérêt par des virgules
              </p>
            </div>
            
            <div>
              <Label htmlFor="skills">Compétences</Label>
              <Input
                id="skills"
                placeholder="React, Python, Design d'automatisation..."
                value={profileData.skills?.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills')}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Séparez les compétences par des virgules
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="occupation">Profession</Label>
                <Input
                  id="occupation"
                  name="occupation"
                  placeholder="Développeur, Ingénieur..."
                  value={profileData.occupation || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <Label htmlFor="education">Formation</Label>
                <Input
                  id="education"
                  name="education"
                  placeholder="Diplôme, École..."
                  value={profileData.education || ''}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="date_of_birth">Date de naissance</Label>
              <Input
                id="date_of_birth"
                name="date_of_birth"
                type="date"
                value={profileData.date_of_birth || ''}
                onChange={handleInputChange}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Réseaux sociaux</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="social_links.linkedin" className="text-xs">LinkedIn</Label>
                  <Input
                    id="social_links.linkedin"
                    name="social_links.linkedin"
                    placeholder="URL LinkedIn"
                    value={profileData.social_links?.linkedin || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_links.github" className="text-xs">GitHub</Label>
                  <Input
                    id="social_links.github"
                    name="social_links.github"
                    placeholder="URL GitHub"
                    value={profileData.social_links?.github || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_links.twitter" className="text-xs">Twitter</Label>
                  <Input
                    id="social_links.twitter"
                    name="social_links.twitter"
                    placeholder="URL Twitter"
                    value={profileData.social_links?.twitter || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div>
                  <Label htmlFor="social_links.website" className="text-xs">Site web</Label>
                  <Input
                    id="social_links.website"
                    name="social_links.website"
                    placeholder="URL de votre site web"
                    value={profileData.social_links?.website || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="current_password">Mot de passe actuel (requis)</Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Entrez votre mot de passe actuel pour confirmer les modifications"
                disabled={isLoading}
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <div className="text-sm text-muted-foreground mb-2">
          Ces informations sont utilisées pour personnaliser votre expérience et améliorer les recommandations.
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Profil</Badge>
          <Badge variant="outline">Personnalisation</Badge>
          <Badge variant="outline">Préférences</Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ExtendedProfileForm; 