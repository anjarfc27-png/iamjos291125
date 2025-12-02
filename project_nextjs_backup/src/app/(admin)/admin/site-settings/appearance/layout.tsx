"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/I18nContext";
import type { ReactNode } from "react";

type Props = { children: ReactNode };

export default function AppearanceLayout({ children }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  // OJS 3.3 PKPSiteAppearanceForm does not have separate theme/setup tabs
  // Only one appearance form with: pageHeaderTitleImage, pageFooter, sidebar, styleSheet
  // No sub-tabs needed - just show the content directly

  return (
    <div className="space-y-6">
      <div className="mt-6">
        {children}
      </div>
    </div>
  );
}

