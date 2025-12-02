import { redirect } from "next/navigation";

export default function SiteSetupIndexPage() {
  redirect("/admin/site-settings/site-setup/settings");
}