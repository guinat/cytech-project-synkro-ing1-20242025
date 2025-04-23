import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Device edit form schema with client-side validation
const editDeviceSchema = z.object({
  name: z.string().min(2, "The name must be at least 2 characters."),
  serial: z.string().min(2, "The serial number is required.")
});

// Type for device edit form values
export type EditDeviceFormValues = z.infer<typeof editDeviceSchema>;

interface EditDeviceFormProps {
  initialValues: EditDeviceFormValues;
  onSubmit: (data: EditDeviceFormValues) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export const EditDeviceForm: React.FC<EditDeviceFormProps> = ({ initialValues, onSubmit, loading, error }) => {
  // Initialize form with react-hook-form
  const form = useForm<EditDeviceFormValues>({
    resolver: zodResolver(editDeviceSchema),
    defaultValues: initialValues,
  });

  // Handle form submission
  const submit = async (data: EditDeviceFormValues) => {
    await onSubmit(data);
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
                  <FormLabel>Device Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter device name" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serial"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Enter serial number" {...field} disabled={loading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" className="w-full rounded-md" disabled={loading}>
              Update Device
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
