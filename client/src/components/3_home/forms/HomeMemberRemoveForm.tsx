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
  const form = useForm();

  const handleRemove = async () => {
    await onSubmit();
  };

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

  if (className) {
    return formContent;
  }

  return (
    <Card>
      <CardContent>
        {formContent}
      </CardContent>
    </Card>
  );
};
