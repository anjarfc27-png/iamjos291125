import { getNavigationMenus } from "@/features/navigation/actions";
import { MenuEditor } from "@/features/navigation/components/menu-editor";

export const dynamic = 'force-dynamic';

export default async function NavigationPage() {
    const menus = await getNavigationMenus();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#002C40]">Navigation Menus</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the primary and user navigation menus.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {menus.map((menu: any) => (
                    <MenuEditor key={menu.id} menu={menu} />
                ))}
            </div>
        </div>
    );
}
