"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/providers/supabase-provider";

const schema = z
  .object({
    password: z.string().min(8, "Minimal 8 karakter."),
    confirmPassword: z.string().min(8, "Minimal 8 karakter."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const supabase = useSupabase();
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("access_token");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) {
      setError(
        "Token reset tidak ditemukan. Silakan gunakan tautan terbaru dari email Anda.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push("/login?reset=success");
  });

  if (!token) {
    return (
      <FormMessage tone="error">
        Token reset tidak ditemukan. Silakan gunakan tautan terbaru dari email Anda.
      </FormMessage>
    );
  }

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-1">
        <Label htmlFor="password">
          Password Baru <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input id="password" type="password" {...register("password")} />
        {errors.password && (
          <FormMessage tone="error">{errors.password.message}</FormMessage>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="confirmPassword">
          Konfirmasi Password <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <FormMessage tone="error">
            {errors.confirmPassword.message}
          </FormMessage>
        )}
      </div>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="flex items-center justify-end">
        <Button type="submit" loading={loading}>
          Simpan Kata Sandi
        </Button>
      </div>
    </form>
  );
}

