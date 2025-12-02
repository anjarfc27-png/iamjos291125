"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/providers/supabase-provider";

const schema = z.object({
  email: z.string().email("Masukkan email yang valid."),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const supabase = useSupabase();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ email }) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      },
    );

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setMessage(
      "Kami telah mengirim tautan reset password ke email Anda jika terdaftar.",
    );
    setLoading(false);
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-1">
        <Label htmlFor="email">
          Email Terdaftar <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && (
          <FormMessage tone="error">{errors.email.message}</FormMessage>
        )}
      </div>

      {error && <FormMessage tone="error">{error}</FormMessage>}
      {message && <FormMessage tone="success">{message}</FormMessage>}

      <div className="flex items-center justify-between">
        <a
          href="/login"
          className="text-sm font-semibold text-[var(--primary-muted)] hover:text-[var(--primary-dark)]"
        >
          Kembali ke login
        </a>
        <Button type="submit" loading={loading}>
          Kirim Tautan
        </Button>
      </div>
    </form>
  );
}

