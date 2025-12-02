import { getUserDetails } from "@/features/admin/actions/users";
import { ManagerProfileClient } from "./client";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ManagerProfilePage() {
    const supabase = await createSupabaseServerClient();

    // Get current authenticated user
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        redirect("/login");
    }

    // Fetch full user details including settings
    const userDetails = await getUserDetails(authUser.id);

    if (!userDetails) {
        return <div>User profile not found.</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-900">My Profile</h1>
            <ManagerProfileClient user={userDetails} />
        </div>
    );
}
