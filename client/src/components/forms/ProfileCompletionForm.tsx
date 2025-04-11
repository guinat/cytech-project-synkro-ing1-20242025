import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Composants UI
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Schéma de validation
const profileFormSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  date_of_birth: z
    .string()
    .regex(/^(\d{2})\/(\d{2})\/(\d{4})$/, "Invalid date format (DD/MM/YYYY)")
    .refine((val) => {
      // Additional date validation
      const [day, month, year] = val.split('/').map(Number);
      const date = new Date(year, month - 1, day);
      
      // Check that the date is valid
      return date instanceof Date && !isNaN(date.getTime()) 
          && date.getDate() === day 
          && date.getMonth() === month - 1 
          && date.getFullYear() === year;
    }, "Invalid date"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  home_role: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileCompletionForm = () => {
  const { updateProfile, uploadAvatar, user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gérer le téléchargement d'avatar
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Vérifier que c'est une image
      if (!file.type.startsWith('image/')) {
        toast.error("The file must be an image");
        return;
      }
      
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("The image must be less than 5MB");
        return;
      }
      
      // Créer une URL pour la prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setAvatarFile(file);
    }
  };
  
  // Supprimer l'avatar sélectionné
  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Formulaire avec React Hook Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      date_of_birth: user?.date_of_birth 
        ? new Date(user.date_of_birth).toLocaleDateString('fr-FR') 
        : "",
      gender: user?.gender || undefined,
      home_role: user?.home_role || "",
    },
  });

  // Soumission du formulaire
  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);

    try {
      // Conversion du format de date DD/MM/YYYY vers YYYY-MM-DD pour l'API
      const [day, month, year] = values.date_of_birth.split('/');
      const formattedDate = `${year}-${month}-${day}`;

      // Mise à jour du profil via l'API en utilisant any pour contourner le typage
      const userData = {
        first_name: values.first_name,
        last_name: values.last_name,
        gender: values.gender,
        date_of_birth: formattedDate,
        home_role: values.home_role,
        // Ne pas envoyer current_password pour la complétion initiale
      };
      
      console.log('Data sent for profile update:', userData);
      
      await (updateProfile as any)(userData);
      
      // Si un fichier avatar est sélectionné, on l'envoie aussi
      if (avatarFile) {
        console.log('Sending avatar...');
        try {
          await uploadAvatar(avatarFile);
          console.log('Avatar sent successfully');
        } catch (avatarError: any) {
          console.error('Error sending avatar:', avatarError);
          // On continue quand même, car l'avatar est optionnel
          toast.error("Error uploading avatar, but your profile has been updated");
        }
      }

      toast.success("Profile completed successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Complete error:', error);
      let errorMessage = "Error updating profile";
      if (error.name === 'ApiError') {
        errorMessage = error.message;
        // Afficher plus de détails si disponibles
        if (error.details) {
          console.error('Error details:', error.details);
        }
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="h3-title">Complete your profile</CardTitle>
        <CardDescription>
          Please complete this information to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last name <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Smith" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date_of_birth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of birth <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="DD/MM/YYYY" 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender <span className="text-red-500">*</span></FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="home_role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home role</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Parent, child, roommate..." 
                      {...field} 
                      disabled={isLoading} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Champ pour l'avatar */}
            <div className="space-y-2">
              <FormLabel htmlFor="avatar">Profile picture</FormLabel>
              <div className="flex flex-col items-center space-y-4">
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-24 h-24 rounded-full object-cover border"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      aria-label="Remove image"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                )}
                
                <div className="flex flex-col items-center space-y-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    Select an image
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG or GIF. Max 5MB.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="avatar"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Complete my profile"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        All fields marked with <span className="text-red-500 mx-1">*</span> are required
      </CardFooter>
    </Card>
  );
};

export default ProfileCompletionForm;