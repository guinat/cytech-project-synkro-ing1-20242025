import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface HomeDeleteFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const HomeDeleteForm: React.FC<HomeDeleteFormProps> = ({ onSubmit, loading, error }) => {
  const form = useForm();

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
              disabled={loading} 
              className="w-full rounded-md" 
              variant="destructive"
            >
              Delete Home
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
