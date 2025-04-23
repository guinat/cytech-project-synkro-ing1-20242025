import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface HomeInvitationDeleteFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
  iconOnly?: boolean;
}

export const HomeInvitationDeleteForm: React.FC<HomeInvitationDeleteFormProps> = ({ 
  onSubmit, 
  loading, 
  error, 
  className,
  iconOnly = true
}) => {
  // Initialize form with react-hook-form
  const form = useForm();

  // Handle form submission
  const handleDelete = async () => {
    await onSubmit();
  };

  // Icon-only version for inline usage
  if (iconOnly) {
    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleDelete)} className={className}>
          {error && <p className="text-destructive text-xs mb-1">{error}</p>}
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={loading}
            aria-label="Delete Invitation"
            className="hover:bg-destructive/10 text-destructive"
            style={{ padding: 0 }}
          >
            <X className="w-4 h-4" />
          </Button>
        </form>
      </Form>
    );
  }

  // Standard button version with card wrapper
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleDelete)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button 
          type="submit" 
          variant="destructive" 
          disabled={loading} 
          className="w-full rounded-md"
        >
          {loading ? "Deleting..." : "Delete Invitation"}
        </Button>
      </form>
    </Form>
  );

  // If className is provided, assume custom container and return form only
  if (className) {
    return formContent;
  }

  // Default view with Card wrapper
  return (
    <Card>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};
