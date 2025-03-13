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

interface StatusBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {
  text?: string
  pulse?: boolean
}

function StatusBadge({
  className,
  variant,
  position,
  text,
  pulse = true,
  ...props
}: StatusBadgeProps) {
  // Déterminer les couleurs en fonction du variant
  const getPingColor = () => {
    switch (variant) {
      case "success": return "bg-green-400";
      case "error": return "bg-red-400";
      case "warning": return "bg-yellow-400";
      case "info": return "bg-blue-400";
      default: return "bg-purple-400";
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case "success": return "bg-green-500";
      case "error": return "bg-red-500";
      case "warning": return "bg-yellow-500";
      case "info": return "bg-blue-500";
      default: return "bg-purple-500";
    }
  };

  return (
    <span
      className={cn(statusBadgeVariants({ variant, position }), position === "inline" ? "my-auto" : "", className)}
      {...props}
    >
      <span className="mr-1.5 flex h-2 w-2 self-center">
        {pulse && (
          <span className={`absolute inline-flex h-2 w-2 animate-ping rounded-full ${getPingColor()} opacity-75`}></span>
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${getDotColor()}`}></span>
      </span>
      {text && <span className="align-middle">{text}</span>}
    </span>
  )
}

export { StatusBadge, statusBadgeVariants }