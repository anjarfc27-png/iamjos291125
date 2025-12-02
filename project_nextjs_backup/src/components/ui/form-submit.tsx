"use client";

import type { ComponentProps } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "./button";

type Props = ComponentProps<typeof Button> & {
  confirmMessage?: string;
};

export function FormSubmitButton({ confirmMessage, ...props }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      loading={pending}
      onClick={(event) => {
        if (confirmMessage && !window.confirm(confirmMessage)) {
          event.preventDefault();
        }
        props.onClick?.(event);
      }}
      {...props}
    />
  );
}

