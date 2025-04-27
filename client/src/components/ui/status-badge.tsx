import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const statusBadgeVariants = cva(
  "flex items-center rounded-br rounded-tl text-xs font-medium",
  {
    variants: {
      variant: {
        default: "text-purple-300",
        success: "text-green-300",
        error: "text-red-300",
        warning: "text-yellow-300",
        info: "text-blue-300",
        gray: "text-gray-300",
        destructive: "text-red-400",
      },
      position: {
        default: "absolute bottom-1.5 right-2",
        topRight: "absolute top-1.5 right-2",
        bottomLeft: "absolute bottom-1.5 left-2",
        topLeft: "absolute top-1.5 left-2",
        inline: "relative inline-flex",
      },
    },
    defaultVariants: {
      variant: "default",
      position: "default",
    },
  }
)

// Type for the variant
type StatusVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'gray' | 'destructive';

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  text?: string;
  pulse?: boolean;
  status?: string; // This will map to a variant
}

function StatusBadge({
  className,
  variant,
  position,
  text,
  status,
  pulse = true,
  children,
  ...props
}: StatusBadgeProps) {
  // Map status to variant, defaulting to 'default' if not recognized
  const mapStatusToVariant = (status?: string): StatusVariant => {
    if (!status) return variant as StatusVariant || 'default';
    
    // Map common status values to variants
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'warning': return 'warning';
      case 'info': return 'info';
      case 'gray': return 'gray';
      case 'destructive': return 'destructive';
      case 'online': return 'success';
      case 'offline': return 'gray';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };
  
  // Get the effective variant based on status or explicit variant prop
  const effectiveVariant = mapStatusToVariant(status);
  
  // Determine colors based on the effective variant
  const getPingColor = () => {
    switch (effectiveVariant) {
      case "success": return "bg-green-400";
      case "error": case "destructive": return "bg-red-400";
      case "warning": return "bg-yellow-400";
      case "info": return "bg-blue-400";
      case "gray": return "bg-gray-400";
      default: return "bg-purple-400";
    }
  };

  const getDotColor = () => {
    switch (effectiveVariant) {
      case "success": return "bg-green-500";
      case "error": case "destructive": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      case "info": return "bg-blue-500";
      case "gray": return "bg-gray-500";
      default: return "bg-purple-500";
    }
  };

  return (
    <span
      className={cn(statusBadgeVariants({ variant: effectiveVariant, position }), position === "inline" ? "my-auto" : "", className)}
      {...props}
    >
      <span className="mr-1.5 flex h-2 w-2 self-center">
        {pulse && (
          <span className={`absolute inline-flex h-2 w-2 animate-ping rounded-full ${getPingColor()} opacity-75`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${getDotColor()}`}></span>
      </span>
      {text && <span className="align-middle">{text}</span>}
      {children && <span className="align-middle">{children}</span>}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }