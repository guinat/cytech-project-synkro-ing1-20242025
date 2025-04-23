import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface UserDeleteFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const UserDeleteForm: React.FC<UserDeleteFormProps> = ({ onSubmit, loading, error }) => {
  // Initialize form with react-hook-form
  const form = useForm();

  // Handle form submission
  const handleDelete = async () => {
    await onSubmit();
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleDelete)} className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button 
              type="submit" 
              variant="destructive" 
              disabled={loading} 
              className="w-full rounded-md"
            >
              {loading ? "Deleting..." : "Delete My Account"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
