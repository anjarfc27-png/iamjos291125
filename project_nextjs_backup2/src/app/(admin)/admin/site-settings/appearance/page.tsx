import { redirect } from "next/navigation";

// OJS 3.3 PKPSiteAppearanceForm does not have separate theme tab
// Redirect to setup page which contains the actual appearance settings
export default function AppearanceIndexPage() {
  redirect("/admin/site-settings/appearance/setup");
}

