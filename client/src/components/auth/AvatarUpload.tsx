import React, { useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
  previewUrl: string | null;
  onChange: (file: File | null) => void;
  error?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  previewUrl,
  onChange,
  error
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
    
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Avatar className="w-24 h-24 border border-border">
        <AvatarImage src={previewUrl || undefined} alt="Profile avatar" />
        <AvatarFallback className="bg-muted text-primary text-xl">
          {/* Display placeholder if no image */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-center gap-1">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleButtonClick}
          className={error ? 'border-destructive' : ''}
        >
          Upload Photo
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg, image/png, image/jpg"
          className="hidden"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG up to 5MB
        </p>
      </div>
    </div>
  );
}; 