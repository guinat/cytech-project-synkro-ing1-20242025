import React from 'react';
import { cn } from '@/lib/utils';

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  className,
  ...props 
}) => {
  const sizeClass = {
    'sm': 'w-4 h-4 border-2',
    'md': 'w-8 h-8 border-3',
    'lg': 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid border-primary border-t-transparent',
        sizeClass[size],
        className
      )}
      {...props}
    />
  );
}; 