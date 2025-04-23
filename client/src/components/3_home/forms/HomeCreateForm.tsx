import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

// Home creation form schema with client-side validation
const homeCreateSchema = z.object({
  name: z.string().min(1, "Home name is required"),
});

// Type for home creation form values
type HomeCreateFormValues = z.infer<typeof homeCreateSchema>;

interface HomeCreateFormProps {
  onSubmit: (data: HomeCreateFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const HomeCreateForm: React.FC<HomeCreateFormProps> = ({ onSubmit, loading, error }) => {
  // Initialize form with react-hook-form
  const form = useForm<HomeCreateFormValues>({
    resolver: zodResolver(homeCreateSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle form submission
  const submit = async (data: HomeCreateFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Home Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter home name" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              Create Home
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
