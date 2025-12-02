"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/providers/supabase-provider";

import { registerSchema, type RegisterFormValues } from "../schemas";

const COUNTRIES = [
  "Indonesia",
  "Malaysia",
  "Singapura",
  "Brunei Darussalam",
  "Thailand",
  "Vietnam",
  "Filipina",
] as const;

const ROLE_OPTIONS: { value: RegisterFormValues["registerAs"][number]; label: string }[] =
  [
    { value: "reader", label: "Pembaca" },
    { value: "author", label: "Penulis" },
    { value: "reviewer", label: "Reviewer" },
  ];

export function RegisterForm() {
  const supabase = useSupabase();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      registerAs: ["reader"],
      consent: true,
    },
  });

  const registerAs =
    useWatch({
      control,
      name: "registerAs",
    }) ?? [];

  const consent =
    useWatch({
      control,
      name: "consent",
    }) ?? false;

  const toggleRole = (role: RegisterFormValues["registerAs"][number]) => {
    const next = registerAs.includes(role)
      ? registerAs.filter((item) => item !== role)
      : [...registerAs, role];
    setValue("registerAs", next, { shouldValidate: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    setError(null);

    const { email, password, givenName, familyName, affiliation, username } =
      values;

    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          given_name: givenName,
          family_name: familyName,
          affiliation,
          username,
          register_as: values.registerAs.join(","),
        },
      },
    });

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push("/login?registered=true");
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="givenName">
            Nama Depan <span className="text-[#b91c1c]">*</span>
          </Label>
          <Input id="givenName" {...register("givenName")} />
          {errors.givenName && (
            <FormMessage tone="error">{errors.givenName.message}</FormMessage>
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor="familyName">Nama Belakang</Label>
          <Input id="familyName" {...register("familyName")} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="affiliation">
          Afiliasi <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input id="affiliation" {...register("affiliation")} />
        {errors.affiliation && (
          <FormMessage tone="error">{errors.affiliation.message}</FormMessage>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="country">
          Negara <span className="text-[#b91c1c]">*</span>
        </Label>
        <select
          id="country"
          className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          {...register("country")}
        >
          <option value="">Pilih negara</option>
          {COUNTRIES.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
        {errors.country && (
          <FormMessage tone="error">{errors.country.message}</FormMessage>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">
          Email <span className="text-[#b91c1c]">*</span>
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

      <div className="space-y-1">
        <Label htmlFor="username">
          Username <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input id="username" autoComplete="username" {...register("username")} />
        {errors.username && (
          <FormMessage tone="error">{errors.username.message}</FormMessage>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="password">
            Password <span className="text-[#b91c1c]">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            {...register("password")}
          />
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
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <FormMessage tone="error">
              {errors.confirmPassword.message}
            </FormMessage>
          )}
        </div>
      </div>

      <div className="space-y-3 rounded-md border border-[var(--border)] p-4">
        <p className="text-sm font-semibold text-[var(--foreground)]">
          Daftar sebagai <span className="text-[#b91c1c]">*</span>
        </p>
        <div className="flex flex-col gap-3 md:flex-row md:gap-6">
          {ROLE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-center gap-2 text-sm text-[var(--foreground)]"
            >
              <Checkbox
                checked={registerAs.includes(role.value)}
                onChange={() => toggleRole(role.value)}
              />
              {role.label}
            </label>
          ))}
        </div>
        {errors.registerAs && (
          <FormMessage tone="error">{errors.registerAs.message}</FormMessage>
        )}
      </div>

      <label className="flex items-start gap-2 text-sm text-[var(--foreground)]">
        <Checkbox
          className="mt-1"
          checked={consent}
          onChange={(event) =>
            setValue("consent", event.target.checked, { shouldValidate: true })
          }
        />
        Saya menyetujui persyaratan dan kondisi penggunaan situs ini.
      </label>
      {errors.consent && (
        <FormMessage tone="error">{errors.consent.message}</FormMessage>
      )}

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="flex items-center justify-between">
        <a
          href="/login"
          className="text-sm font-semibold text-[var(--primary-muted)] hover:text-[var(--primary-dark)]"
        >
          Sudah punya akun? Masuk
        </a>
        <Button type="submit" loading={loading}>
          Daftar
        </Button>
      </div>
    </form>
  );
}

