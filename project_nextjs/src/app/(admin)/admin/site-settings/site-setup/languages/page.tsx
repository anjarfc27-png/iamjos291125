import { getSiteLanguages, installLocaleAction, updateSiteLanguagesAction } from "../../actions";
import { LOCALE_MAP } from "@/lib/locales";
import LanguagesPageClient from "./languages-client";

export const dynamic = 'force-dynamic';

export default async function SiteSetupLanguagesPage() {
  const initial = await getSiteLanguages();
  const installedLocales = Object.values(LOCALE_MAP);

  async function installLocaleWrapper(formData: FormData) {
    "use server";
    const localeCode = formData.get("locale_code") as string;
    if (localeCode) {
      await installLocaleAction(localeCode);
    }
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <header style={{
        padding: "1rem 1.5rem",
        backgroundColor: "#f9fafb",
        borderBottom: '1px solid #e5e5e5',
        marginBottom: '1.5rem'
      }}>
        <h2 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: '#002C40',
          margin: 0
        }}>
          Languages
        </h2>
      </header>
      <div style={{ padding: '0 1.5rem 2rem 1.5rem' }}>
        <LanguagesPageClient
          initial={initial}
          installedLocales={installedLocales}
          updateAction={updateSiteLanguagesAction}
          installAction={installLocaleWrapper}
        />
      </div>
    </div>
  );
}
