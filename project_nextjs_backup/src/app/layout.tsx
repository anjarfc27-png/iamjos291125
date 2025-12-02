import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";

import "./globals.css";
import { AppProviders } from "./providers";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Journal Systems 3.3 Clone",
  description:
    "Replika antarmuka Site Administration OJS 3.3 menggunakan Next.js & Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html suppressHydrationWarning>
      <body className={`${notoSans.variable} bg-[var(--background)] antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
