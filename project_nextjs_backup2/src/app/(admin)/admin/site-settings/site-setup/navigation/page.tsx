import { getSiteNavigation, updateSiteNavigationAction } from "../../actions";
import { NavigationBuilder } from "@/features/admin/components/navigation-builder";
import { Button } from "@/components/ui/button";

export const dynamic = 'force-dynamic';

export default async function SiteSetupNavigationPage() {
  const initial = await getSiteNavigation();

  return (
    <div className="font-sans">
      <header className="px-6 py-4 bg-gray-50 border-b mb-6">
        <h2 className="text-base font-semibold text-[#002C40] m-0">
          Navigation
        </h2>
      </header>

      <form action={updateSiteNavigationAction} className="flex flex-col gap-6 max-w-3xl">
        <NavigationBuilder
          name="primary"
          label="Primary Navigation"
          description="Menu items for the main navigation bar."
          initialItems={initial.primary}
        />

        <NavigationBuilder
          name="user"
          label="User Navigation"
          description="Menu items for the user dropdown menu."
          initialItems={initial.user}
        />

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" className="bg-[#006798] hover:bg-[#005a87]">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
