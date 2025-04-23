import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Home color change form schema with client-side validation
const homeColorChangeSchema = z.object({
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/i, "Invalid hexadecimal color"),
});

// Type for home color change form values
type HomeColorChangeFormValues = z.infer<typeof homeColorChangeSchema>;

interface HomeColorChangeFormProps {
  color: string;
  onSubmit: (data: HomeColorChangeFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
}

export const HomeColorChangeForm: React.FC<HomeColorChangeFormProps> = ({ color, onSubmit, loading, error, children }) => {
  // Initialize form with react-hook-form
  const form = useForm<HomeColorChangeFormValues>({
    resolver: zodResolver(homeColorChangeSchema),
    defaultValues: { color },
  });

  // Handle form submission
  const submit = async (data: HomeColorChangeFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  // If children is provided, use palette mode (custom button)
  if (children) {
    return (
      <form onSubmit={form.handleSubmit(submit)} style={{ display: 'inline' }}>
        <input type="hidden" name="color" value={color} />
        <button 
          type="submit" 
          disabled={loading} 
          style={{ padding: 0, border: 'none', background: 'none' }}
        >
          {children}
        </button>
        {form.formState.errors.color && (
          <p className="text-destructive text-xs mt-1">{form.formState.errors.color.message}</p>
        )}
        {error && <p className="text-destructive text-xs mt-1">{error}</p>}
      </form>
    );
  }

  // Modern input mode with shadcn UI components
  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-4">
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        {...field}
                        disabled={loading}
                        className="w-16 h-10 p-1"
                      />
                      <Input 
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        disabled={loading}
                        placeholder="#FFFFFF"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              Change Color
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
