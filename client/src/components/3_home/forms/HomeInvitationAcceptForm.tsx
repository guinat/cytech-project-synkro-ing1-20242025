import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface HomeInvitationAcceptFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
  label?: string;
}

export const HomeInvitationAcceptForm: React.FC<HomeInvitationAcceptFormProps> = ({ 
  onSubmit, 
  loading, 
  error, 
  className,
  label 
}) => {
  const form = useForm();

  const handleAccept = async () => {
    await onSubmit();
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAccept)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-md"
          variant="default"
          aria-label="Accept invitation"
        >
          {label || "Accept Invitation"}
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
