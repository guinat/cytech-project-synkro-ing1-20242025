import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface HomeMemberRemoveFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
}

export const HomeMemberRemoveForm: React.FC<HomeMemberRemoveFormProps> = ({ 
  onSubmit, 
  loading, 
  error,
  className
}) => {
  // Initialize form with react-hook-form
  const form = useForm();

  // Handle form submission
  const handleRemove = async () => {
    await onSubmit();
  };

  // Allow for flexible rendering with or without card wrapper
  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleRemove)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button 
          type="submit" 
          variant="destructive" 
          disabled={loading} 
          className="w-full rounded-md"
        >
          {loading ? "Removing..." : "Remove Member"}
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
