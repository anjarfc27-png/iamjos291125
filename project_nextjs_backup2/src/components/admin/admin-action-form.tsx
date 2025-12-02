"use client";

import type { ComponentProps, ReactNode } from "react";
import { useActionState } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { FormSubmitButton } from "@/components/ui/form-submit";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const INITIAL_STATE: AdminActionState = { status: "idle" };

type Props = {
  action: (state: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  buttonLabel: string;
  confirmMessage?: string;
  description?: ReactNode;
  variant?: ComponentProps<typeof FormSubmitButton>["variant"];
};

export function AdminActionForm({ action, buttonLabel, confirmMessage, description, variant = "primary" }: Props) {
  const [state, formAction] = useActionState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="space-y-3">
      {description && <p className="text-sm text-[var(--muted)]">{description}</p>}
      {state.status !== "idle" && state.message && (
        <FormMessage tone={state.status === "success" ? "success" : "error"}>{state.message}</FormMessage>
      )}
      <FormSubmitButton confirmMessage={confirmMessage} variant={variant}>
        {buttonLabel}
      </FormSubmitButton>
    </form>
  );
}

