import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarIcon, CheckIcon, ImageIcon, InfoIcon, UserIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface ProfileCompletionFormProps {
  className?: string;
  onComplete?: () => void;
}

export function ProfileCompletionForm({ className, onComplete }: ProfileCompletionFormProps) {
  const { user, updateUserProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [birthdate, setBirthdate] = useState<Date | undefined>(
    user?.date_of_birth ? new Date(user.date_of_birth) : undefined
  );
  const [bio, setBio] = useState(user?.bio || '');
  const [phone, setPhone] = useState(user?.phone_number || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user?.avatar || null);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user?.avatar_url || null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour le pourcentage de complétion
  useEffect(() => {
    const requiredFields = [
      { name: 'firstName', value: !!firstName },
      { name: 'lastName', value: !!lastName },
      { name: 'birthdate', value: !!birthdate },
      { name: 'bio', value: !!bio },
      { name: 'phone', value: !!phone }
    ];
    
    const completedFieldsCount = requiredFields.filter(field => field.value).length;
    const percentage = (completedFieldsCount / requiredFields.length) * 100;
    setCompletionPercentage(percentage);
  }, [firstName, lastName, birthdate, bio, phone, profilePicture, previewUrl]);

  // Gestionnaire pour le téléchargement d'image
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewUrl(result);
        setProfilePicture(result); // Stocker également l'image en base64
      };
      reader.readAsDataURL(file);
      
      // Clear error for profile picture
      if (errors.profilePicture) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.profilePicture;
          return newErrors;
        });
      }
    }
  };

  // Fonction pour convertir un fichier en base64
  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    
    if (!birthdate) {
      newErrors.birthdate = 'La date de naissance est requise';
    } else {
      const today = new Date();
      if (birthdate > today) {
        newErrors.birthdate = 'La date de naissance ne peut pas être dans le futur';
      } else {
        const age = today.getFullYear() - birthdate.getFullYear();
        if (age < 13 || age > 120) {
          newErrors.birthdate = 'Veuillez entrer une date de naissance valide';
        }
      }
    }
    
    if (!bio.trim()) {
      newErrors.bio = 'La biographie est requise';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    } else {
      // Regex plus flexible pour les numéros de téléphone internationaux
      const phoneRegex = /^(\+?\d{1,4})?[-\s.]?(\(?\d{1,}\)?[-\s.]?){1,}$/;
      if (!phoneRegex.test(phone.trim())) {
        newErrors.phone = 'Veuillez entrer un numéro de téléphone valide';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Formulaire invalide', {
        description: 'Veuillez corriger les erreurs dans le formulaire',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Début de la soumission du formulaire de complétion de profil', {
        firstName, lastName, birthdate, bio, phone
      });
      
      // Préparer les données à envoyer
      const data: any = {
        first_name: firstName,
        last_name: lastName,
        birthdate: birthdate,
        bio: bio,
        phone_number: phone,
        is_profile_completed: true // S'assurer que ce flag est explicitement envoyé
      };
      
      // Si un fichier de photo de profil a été sélectionné
      if (profilePicture && profilePicture.startsWith('data:')) {
        data.profile_picture = profilePicture;
      }
      
      console.log('Envoi des données au serveur pour complétion de profil', {
        fields: Object.keys(data),
        is_profile_completed: data.is_profile_completed
      });
      
      // Mettre à jour le profil via le context d'authentification
      await updateUserProfile(data);
      
      console.log('Profil mis à jour avec succès');
      
      // Marquer dans la session que le profil vient d'être complété
      sessionStorage.setItem('profile_just_completed', 'true');
      console.log('Complétion du profil marquée dans le stockage de session');
      
      // Force l'objet user à avoir is_profile_completed=true dans la mémoire locale
      if (user) {
        const updatedUser = {
          ...user,
          is_profile_completed: true,
          first_name: firstName,
          last_name: lastName,
          date_of_birth: birthdate?.toISOString().split('T')[0],
          bio: bio,
          phone_number: phone
        };
        
        // Mettre à jour le cache local avec la nouvelle valeur
        try {
          localStorage.setItem('user_cache', JSON.stringify(updatedUser));
          console.log('Cache utilisateur mis à jour avec le drapeau de profil complété', updatedUser);
        } catch (err) {
          console.error('Erreur lors de la mise à jour du cache utilisateur:', err);
        }
      }
      
      toast.success('Profil complété avec succès!');
      
      if (onComplete) {
        console.log('Appel de la fonction onComplete après complétion du profil');
        onComplete();
      }
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      
      // Afficher les erreurs spécifiques si disponibles
      if (error.response?.data?.errors) {
        const errorMessages = Object.entries(error.response.data.errors)
          .map(([field, message]) => `${field}: ${message}`)
          .join(', ');
        toast.error(`Erreur: ${errorMessages}`);
      } else {
        toast.error('Erreur lors de la mise à jour du profil. Veuillez réessayer.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn("max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckIcon className="h-5 w-5 text-primary" />
          Compléter votre profil
        </CardTitle>
        <CardDescription>
          Complétez votre profil pour accéder à toutes les fonctionnalités de l'application
        </CardDescription>
        
        <div className="mt-2">
          <div className="flex justify-between text-sm mb-1">
            <span>Progression</span>
            <span>{Math.round(completionPercentage)}%</span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo de profil */}
          <div className="flex flex-col items-center space-y-4">
            <Label htmlFor="profile-picture" className="cursor-pointer w-24 h-24 relative">
              <Avatar className="w-24 h-24 border-2 border-primary/20 hover:border-primary transition-colors">
                {previewUrl ? (
                  <AvatarImage src={previewUrl} alt="Preview" />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <UserIcon className="h-12 w-12" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1">
                <ImageIcon className="h-4 w-4" />
              </div>
            </Label>
            <Input
              id="profile-picture"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground">
              Cliquez sur l'avatar pour télécharger une photo
            </span>
            {errors.profilePicture && (
              <p className="text-sm text-destructive">{errors.profilePicture}</p>
            )}
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name" className="flex items-center gap-1">
                Prénom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Votre prénom"
                required
                disabled={isLoading}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">{errors.firstName}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="last-name" className="flex items-center gap-1">
                Nom <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Votre nom"
                required
                disabled={isLoading}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">{errors.lastName}</p>
              )}
            </div>
          </div>
          
          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-1">
              Numéro de téléphone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Votre numéro de téléphone"
              required
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>
          
          {/* Date de naissance */}
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="flex items-center gap-1">
              Date de naissance <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !birthdate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {birthdate ? format(birthdate, 'PPP', { locale: fr }) : "Sélectionner une date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={birthdate}
                  onSelect={setBirthdate}
                  initialFocus
                  disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                />
              </PopoverContent>
            </Popover>
            {errors.birthdate && (
              <p className="text-sm text-destructive">{errors.birthdate}</p>
            )}
          </div>
          
          {/* Biographie */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-1">
              Biographie <span className="text-destructive">*</span>
              <Popover>
                <PopoverTrigger>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <p className="text-sm">
                    Parlez-nous un peu de vous, de vos intérêts et de ce qui vous passionne.
                    Ces informations aideront à personnaliser votre expérience.
                  </p>
                </PopoverContent>
              </Popover>
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Parlez-nous un peu de vous..."
              className="min-h-24"
              required
              disabled={isLoading}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio}</p>
            )}
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || completionPercentage < 100}
            >
              {isLoading ? "Enregistrement..." : "Compléter mon profil"}
            </Button>
          </div>
        </form>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start text-sm text-muted-foreground">
        <p>
          Les champs marqués d'un <span className="text-destructive">*</span> sont obligatoires.
          La complétion de votre profil permettra de débloquer toutes les fonctionnalités.
        </p>
      </CardFooter>
    </Card>
  );
}

export default ProfileCompletionForm; 