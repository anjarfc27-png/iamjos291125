import { redirect } from "next/navigation";

// OJS 3.3 PKPSiteAppearanceForm does not have a separate theme page
// Redirect to setup page which contains the actual appearance settings
export default function ThemeManagementPage() {
  redirect("/admin/site-settings/appearance/setup");
}
