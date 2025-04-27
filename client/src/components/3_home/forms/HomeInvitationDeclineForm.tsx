import React from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

interface HomeInvitationDeclineFormProps {
  onSubmit: () => Promise<void>;
  loading?: boolean;
  error?: string | null;
  className?: string;
  label?: string;
}

export const HomeInvitationDeclineForm: React.FC<HomeInvitationDeclineFormProps> = ({ 
  onSubmit, 
  loading, 
  error, 
  className,
  label 
}) => {
  const form = useForm();

  const handleDecline = async () => {
    await onSubmit();
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleDecline)} className={`space-y-4 ${className || ''}`}>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-md"
          variant="outline"
          aria-label="Decline invitation"
        >
          {label || "Decline Invitation"}
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
