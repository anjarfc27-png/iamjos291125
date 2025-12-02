"use client";

import { useRouter } from "next/navigation";
import { ProfileForm } from "@/features/admin/components/profile-form";

type UserDetails = {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    settings: Record<string, string>;
};

type Props = {
    user: UserDetails;
};

export function AdminProfileClient({ user }: Props) {
    const router = useRouter();

    return (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <ProfileForm
                user={user}
                onSuccess={() => {
                    router.refresh();
                }}
            />
        </div>
    );
}
