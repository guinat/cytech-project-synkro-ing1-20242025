import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const homeQuickCreateSchema = z.object({
  name: z.string().min(2, "The name must be at least 2 characters.")
});

type HomeQuickCreateFormValues = z.infer<typeof homeQuickCreateSchema>;

interface HomeQuickCreateFormProps {
  onSubmit: (data: HomeQuickCreateFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  horizontal?: boolean;
}

export const HomeQuickCreateForm: React.FC<HomeQuickCreateFormProps> = ({ 
  onSubmit, 
  loading, 
  error,
  horizontal = true 
}) => {
  const form = useForm<HomeQuickCreateFormValues>({
    resolver: zodResolver(homeQuickCreateSchema),
    defaultValues: { name: "" },
  });

  const submit = async (data: HomeQuickCreateFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  const formContent = (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(submit)} 
        className={horizontal ? "flex items-center gap-2" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className={horizontal ? "flex-1 mb-0" : ""}>
              {!horizontal && <FormControl>
                <Input
                  autoFocus
                  placeholder="Enter home name"
                  {...field}
                  disabled={loading}
                />
              </FormControl>}
              {horizontal && <Input
                autoFocus
                placeholder="Enter home name"
                {...field}
                disabled={loading}
              />}
              {!horizontal && <FormMessage />}
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className={horizontal ? "shrink-0" : "w-full rounded-md"}
        >
          Create
        </Button>
        {horizontal && form.formState.errors.name && (
          <span className="text-destructive text-xs ml-2">{form.formState.errors.name.message}</span>
        )}
        {error && <span className="text-destructive text-xs ml-2">{error}</span>}
      </form>
    </Form>
  );

  if (horizontal) {
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
