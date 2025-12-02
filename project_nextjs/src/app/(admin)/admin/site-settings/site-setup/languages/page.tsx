import { getSiteLanguages, updateSiteLanguagesAction, installLocaleAction } from "../../actions";
import { getLocaleInfo } from "@/lib/locales";
import LanguagesPageClient from "./languages-client";

export default async function SiteSetupLanguagesPage() {
  const initial = await getSiteLanguages();
  const installedLocales = initial.enabled_locales.map((code) => getLocaleInfo(code)).filter(Boolean);

  // Server action wrapper yang menerima FormData (dipanggil dari Client Component)
  async function installLocaleActionWrapper(formData: FormData) {
    "use server";
    const localeCode = formData.get("locale_code");
    if (typeof localeCode === "string" && localeCode.trim()) {
      await installLocaleAction(localeCode.trim());
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
      
      <LanguagesPageClient 
        initial={initial} 
        installedLocales={installedLocales}
        updateAction={updateSiteLanguagesAction}
        installAction={installLocaleActionWrapper}
      />
    </div>
  );
}
