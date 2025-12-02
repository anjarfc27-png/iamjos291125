import { getAnnouncements, deleteAnnouncement } from "@/features/announcements/actions";
import { AnnouncementForm } from "@/features/announcements/components/announcement-form";
import { AnnouncementList } from "@/features/announcements/components/announcement-list";

export default async function AnnouncementsPage() {
    const announcements = await getAnnouncements();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#002C40]">Announcements</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage site-wide and journal announcements.</p>
                </div>
            </div>

            <AnnouncementList announcements={announcements} />
        </div>
    );
}
