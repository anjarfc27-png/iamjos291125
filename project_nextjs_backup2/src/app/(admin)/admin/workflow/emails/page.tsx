import { getEmailTemplates } from "@/features/emails/actions";
import { EmailTemplatesClient } from "./client";

export default async function EmailTemplatesPage() {
    const templates = await getEmailTemplates();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#002C40]">Email Templates</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage the email templates sent by the system.</p>
                </div>
            </div>

            <EmailTemplatesClient templates={templates} />
        </div>
    );
}
