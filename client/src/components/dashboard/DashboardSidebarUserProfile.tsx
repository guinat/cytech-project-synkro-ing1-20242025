import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface UserProfileProps {
  user: {
    username?: string;
    email?: string;
  } | null;
  showFullWidth: boolean;
  onLogout: () => void;
}

const SidebarUserProfile: React.FC<UserProfileProps> = ({
  user,
  showFullWidth,
  onLogout
}) => {
  return (
    <div className={cn(
      "border-t border-border p-3",
      !showFullWidth && "flex justify-center items-center"
    )}>
      {showFullWidth ? (
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {user?.username?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">
                {user?.username || 'User'}
              </span>
              <span className="text-xs text-muted-foreground mt-1 truncate max-w-[120px]">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <Button
            variant="ghost" 
            size="icon"
            onClick={onLogout}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default SidebarUserProfile; 