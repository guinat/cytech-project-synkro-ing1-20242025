import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const homeMemberInviteSchema = z.object({
  email: z.string().email("Invalid email"),
});

type HomeMemberInviteFormValues = z.infer<typeof homeMemberInviteSchema>;

interface HomeMemberInviteFormProps {
  onSubmit: (data: HomeMemberInviteFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  horizontal?: boolean;
}

export const HomeMemberInviteForm: React.FC<HomeMemberInviteFormProps> = ({ 
  onSubmit, 
  loading, 
  error,
  horizontal = true 
}) => {
  const form = useForm<HomeMemberInviteFormValues>({
    resolver: zodResolver(homeMemberInviteSchema),
    defaultValues: { email: "" },
  });
  const submit = async (data: HomeMemberInviteFormValues) => {
    await onSubmit(data);
    form.reset();
  };

  const formContent = (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(submit)} 
        className={horizontal ? "space-y-2 flex items-end gap-2" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className={horizontal ? "flex-1" : ""}>
              <FormLabel>Member Email <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  {...field}
                  disabled={loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className={horizontal ? "shrink-0" : "w-full rounded-md"}
        >
          Invite
        </Button>
        {error && !horizontal && <p className="text-destructive text-sm">{error}</p>}
      </form>
      {error && horizontal && <p className="text-destructive text-sm mt-1">{error}</p>}
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
