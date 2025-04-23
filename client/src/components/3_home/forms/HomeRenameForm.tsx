import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Home rename form schema with client-side validation
const homeRenameSchema = z.object({
  name: z.string().min(1, "The name is required."),
});

// Type for home rename form values
type HomeRenameFormValues = z.infer<typeof homeRenameSchema>;

interface HomeRenameFormProps {
  currentName: string;
  onSubmit: (data: HomeRenameFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const HomeRenameForm: React.FC<HomeRenameFormProps> = ({ onSubmit, loading, error, currentName }) => {
  // Initialize form with react-hook-form
  const form = useForm<HomeRenameFormValues>({
    resolver: zodResolver(homeRenameSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle form submission
  const submit = async (data: HomeRenameFormValues) => {
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
                    <Input
                      placeholder={currentName}
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              Rename Home
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
