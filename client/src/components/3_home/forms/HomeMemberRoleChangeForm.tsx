import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

const homeMemberRoleChangeSchema = z.object({
  role: z.enum(["owner", "admin", "member"], {
    required_error: "The role is required."
  })
});

type HomeMemberRoleChangeFormValues = z.infer<typeof homeMemberRoleChangeSchema>;

interface HomeMemberRoleChangeFormProps {
  initialRole: "owner" | "admin" | "member";
  onSubmit: (data: HomeMemberRoleChangeFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  horizontal?: boolean; 
}

export const HomeMemberRoleChangeForm: React.FC<HomeMemberRoleChangeFormProps> = ({ 
  initialRole, 
  onSubmit, 
  loading, 
  error,
  horizontal = true 
}) => {
  const form = useForm<HomeMemberRoleChangeFormValues>({
    resolver: zodResolver(homeMemberRoleChangeSchema),
    defaultValues: { role: initialRole },
  });

  const submit = async (data: HomeMemberRoleChangeFormValues) => {
    await onSubmit(data);
  };

  const formContent = (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(submit)} 
        className={horizontal ? "flex items-center gap-2" : "space-y-4"}
      >
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem className={horizontal ? "flex-1 mb-0" : ""}>
              {!horizontal && <FormControl>
                <select 
                  {...field} 
                  disabled={loading} 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-all"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              </FormControl>}
              {horizontal && 
                <select 
                  {...field} 
                  disabled={loading} 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-all"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="member">Member</option>
                </select>
              }
              {!horizontal && <FormMessage />}
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          disabled={loading} 
          className={horizontal ? "shrink-0" : "w-full rounded-md"}
        >
          Change Role
        </Button>
        {horizontal && form.formState.errors.role && (
          <span className="text-destructive text-xs ml-2">{form.formState.errors.role.message}</span>
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
