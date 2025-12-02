import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username wajib diisi."),
  password: z.string().min(1, "Password wajib diisi."),
  remember: z.boolean().default(true),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    givenName: z.string().min(1, "Nama depan wajib diisi."),
    familyName: z.string().optional(),
    affiliation: z.string().min(1, "Afiliasi wajib diisi."),
    country: z.string().min(1, "Pilih negara."),
    email: z.string().email("Masukkan email yang valid."),
    username: z
      .string()
      .min(4, "Minimal 4 karakter.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Gunakan huruf, angka, titik, underscore, atau minus."),
    password: z.string().min(8, "Minimal 8 karakter."),
    confirmPassword: z.string().min(8, "Minimal 8 karakter."),
    registerAs: z
      .array(
        z.enum([
          "reader",
          "author",
          "reviewer",
        ]),
      )
      .min(1, "Pilih minimal satu peran."),
    consent: z.boolean().refine((value) => value, "Anda harus menyetujui persyaratan."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

