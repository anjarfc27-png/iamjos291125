"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Loader2, Globe, Mail, Layers, Palette, Users, Plus, Trash2, Edit2 } from "lucide-react";
import { pkpColors, pkpTypography } from "@/lib/theme";
import {
    createSectionAction,
    deleteSectionAction,
    enrollUserAction,
    getSectionsAction,
    getJournalUsersAction
} from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUpload } from "@/components/ui/file-upload";

type TabId = "identity" | "contact" | "sections" | "appearance" | "users";

interface WizardTab {
    id: TabId;
    label: string;
    icon: React.ElementType;
    description: string;
}

const TABS: WizardTab[] = [
    { id: "identity", label: "Masthead", icon: Globe, description: "Journal identity and description" },
    { id: "contact", label: "Contact", icon: Mail, description: "Principal contact information" },
    { id: "sections", label: "Sections", icon: Layers, description: "Manage journal sections" },
    { id: "appearance", label: "Appearance", icon: Palette, description: "Theme and logo" },
    { id: "users", label: "Users", icon: Users, description: "User management" },
];

type JournalSettingsWizardProps = {
    journalId: string;
    initialData?: any;
};

export function JournalSettingsWizard({ journalId, initialData }: JournalSettingsWizardProps) {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();
    const [activeTab, setActiveTab] = useState<TabId>("identity");
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Identity
        name: initialData?.name || "",
        initials: initialData?.initials || "",
        abbreviation: initialData?.abbreviation || "",
        publisher: initialData?.publisher || "",
        description: initialData?.description || "",
        // Contact
        contactName: "",
        contactEmail: "",
        supportName: "",
        supportEmail: "",
        // Appearance
        logoUrl: "",
        themeColor: "#006798",
    });

    // Sections State
    const [sections, setSections] = useState<any[]>([]);
    const [newSection, setNewSection] = useState({ title: "", abbreviation: "", policy: "" });
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);

    // Users State
    const [users, setUsers] = useState<any[]>([]);
    const [enrollEmail, setEnrollEmail] = useState("");
    const [enrollRole, setEnrollRole] = useState("16"); // Default to Manager (16)

    // Data Fetching
    const fetchSections = useCallback(async () => {
        const result = await getSectionsAction(journalId);
        if (result.success) {
            setSections(result.data || []);
        }
    }, [journalId]);

    const fetchUsers = useCallback(async () => {
        const result = await getJournalUsersAction(journalId);
        if (result.success) {
            setUsers(result.data || []);
        }
    }, [journalId]);

    useEffect(() => {
        if (activeTab === "sections") {
            fetchSections();
        } else if (activeTab === "users") {
            fetchUsers();
        }
    }, [activeTab, fetchSections, fetchUsers]);

    const handleSave = async () => {
        setLoading(true);
        try {
            // 1. Update Journal Identity
            const { error: journalError } = await supabase
                .from("journals")
                .update({
                    name: formData.name,
                    description: formData.description,
                })
                .eq("id", journalId);

            if (journalError) throw journalError;

            // 2. Update Settings
            const settingsUpdates = [
                { journal_id: journalId, setting_name: "initials", setting_value: formData.initials },
                { journal_id: journalId, setting_name: "abbreviation", setting_value: formData.abbreviation },
                { journal_id: journalId, setting_name: "publisher", setting_value: formData.publisher },
                { journal_id: journalId, setting_name: "contactName", setting_value: formData.contactName },
                { journal_id: journalId, setting_name: "contactEmail", setting_value: formData.contactEmail },
                { journal_id: journalId, setting_name: "supportName", setting_value: formData.supportName },
                { journal_id: journalId, setting_name: "supportEmail", setting_value: formData.supportEmail },
                { journal_id: journalId, setting_name: "logo", setting_value: formData.logoUrl },
                { journal_id: journalId, setting_name: "themeColor", setting_value: formData.themeColor },
            ];

            const { error: settingsError } = await supabase
                .from("journal_settings")
                .upsert(settingsUpdates, { onConflict: "journal_id, setting_name" });

            if (settingsError) throw settingsError;

            toast.success("Settings saved successfully");
        } catch (error: any) {
            console.error("Error saving settings:", error);
            const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
            toast.error("Failed to save settings: " + msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSection = async () => {
        setLoading(true);
        const result = await createSectionAction({
            journalId,
            title: newSection.title,
            abbreviation: newSection.abbreviation,
            policy: newSection.policy
        });

        if (result.success) {
            toast.success("Section created");
            setIsSectionModalOpen(false);
            setNewSection({ title: "", abbreviation: "", policy: "" });
            fetchSections();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm("Are you sure you want to delete this section?")) return;

        setLoading(true);
        const result = await deleteSectionAction(sectionId, journalId);
        if (result.success) {
            toast.success("Section deleted");
            fetchSections();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    const handleEnrollUser = async () => {
        setLoading(true);
        const result = await enrollUserAction({
            journalId,
            email: enrollEmail,
            roleId: parseInt(enrollRole)
        });

        if (result.success) {
            toast.success("User enrolled");
            setEnrollEmail("");
            fetchUsers();
        } else {
            toast.error(result.message);
        }
        setLoading(false);
    };

    return (
        <div className="flex gap-8 min-h-[600px]">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-[#006798]">Journal Settings</h2>
                    <p className="text-sm text-gray-500">Setup your journal</p>
                </div>
                <nav className="space-y-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors",
                                    isActive
                                        ? "bg-[#006798] text-white shadow-sm"
                                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                                )}
                            >
                                <Icon className="w-4 h-4" />
                                <div className="text-left">
                                    <div className={cn("font-semibold", isActive ? "text-white" : "text-gray-900")}>
                                        {tab.label}
                                    </div>
                                    <div className={cn("text-xs opacity-80", isActive ? "text-blue-100" : "text-gray-500")}>
                                        {tab.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm p-8">
                <div className="max-w-2xl">
                    <div className="mb-8 pb-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {TABS.find(t => t.id === activeTab)?.description}
                        </p>
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === "identity" && (
                            <>
                                <div className="space-y-2">
                                    <Label>Journal Name <span className="text-red-500">*</span></Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Initials</Label>
                                        <Input
                                            value={formData.initials}
                                            onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                                            placeholder="e.g. JSD"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Abbreviation</Label>
                                        <Input
                                            value={formData.abbreviation}
                                            onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Publisher</Label>
                                    <Input
                                        value={formData.publisher}
                                        onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                                        placeholder="Organization name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={5}
                                    />
                                </div>
                            </>
                        )}

                        {activeTab === "contact" && (
                            <>
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-900">Principal Contact</h4>
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={formData.contactName}
                                            onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={formData.contactEmail}
                                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t">
                                    <h4 className="font-semibold text-gray-900">Technical Support Contact</h4>
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input
                                            value={formData.supportName}
                                            onChange={(e) => setFormData({ ...formData, supportName: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Email</Label>
                                        <Input
                                            value={formData.supportEmail}
                                            onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === "sections" && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-medium">Journal Sections</h4>
                                    <Dialog open={isSectionModalOpen} onOpenChange={setIsSectionModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" className="gap-2">
                                                <Plus className="w-4 h-4" /> Create Section
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Section</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input
                                                        value={newSection.title}
                                                        onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Abbreviation</Label>
                                                    <Input
                                                        value={newSection.abbreviation}
                                                        onChange={(e) => setNewSection({ ...newSection, abbreviation: e.target.value })}
                                                    />
                                                </div>
                                                <Button onClick={handleCreateSection} disabled={loading} className="w-full">
                                                    {loading ? "Creating..." : "Create Section"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                <div className="border rounded-md overflow-hidden">
                                    {sections.length === 0 ? (
                                        <div className="p-8 text-center text-gray-500 bg-gray-50">
                                            No sections found. Create one to get started.
                                        </div>
                                    ) : (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Title</TableHead>
                                                    <TableHead>Abbreviation</TableHead>
                                                    <TableHead className="w-[100px]">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {sections.map((section) => (
                                                    <TableRow key={section.id}>
                                                        <TableCell className="font-medium">{section.title}</TableCell>
                                                        <TableCell>{section.abbreviation}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteSection(section.id)}
                                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === "appearance" && (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h4 className="font-medium">Journal Logo</h4>
                                    <FileUpload
                                        bucketName="site-assets"
                                        folderPath={`journals/${journalId}/logo`}
                                        defaultValue={formData.logoUrl}
                                        onUploadComplete={(url) => setFormData({ ...formData, logoUrl: url })}
                                        label="Upload Journal Logo"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <h4 className="font-medium">Theme Color</h4>
                                    <div className="flex gap-4">
                                        {[
                                            { color: "#006798", label: "Default Blue" },
                                            { color: "#059669", label: "Emerald" },
                                            { color: "#7c3aed", label: "Violet" },
                                            { color: "#dc2626", label: "Red" },
                                        ].map((theme) => (
                                            <div
                                                key={theme.color}
                                                onClick={() => setFormData({ ...formData, themeColor: theme.color })}
                                                className={cn(
                                                    "w-10 h-10 rounded-full cursor-pointer transition-all",
                                                    formData.themeColor === theme.color
                                                        ? "ring-2 ring-offset-2 ring-gray-400 scale-110"
                                                        : "hover:scale-105"
                                                )}
                                                style={{ backgroundColor: theme.color }}
                                                title={theme.label}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500">Selected: {formData.themeColor}</p>
                                </div>
                            </div>
                        )}

                        {activeTab === "users" && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="font-medium mb-4">Enroll Existing User</h4>
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Search by email..."
                                                value={enrollEmail}
                                                onChange={(e) => setEnrollEmail(e.target.value)}
                                            />
                                        </div>
                                        <select
                                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                            value={enrollRole}
                                            onChange={(e) => setEnrollRole(e.target.value)}
                                        >
                                            <option value="16">Journal Manager</option>
                                            <option value="17">Journal Editor</option>
                                        </select>
                                        <Button onClick={handleEnrollUser} disabled={loading}>
                                            Enroll
                                        </Button>
                                    </div>
                                </div>

                                <div className="border rounded-md overflow-hidden">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Role</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} className="text-center text-gray-500 py-8">
                                                        No users enrolled yet.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                users.map((user, idx) => (
                                                    <TableRow key={idx}>
                                                        <TableCell className="font-medium">{user.name}</TableCell>
                                                        <TableCell>{user.email}</TableCell>
                                                        <TableCell>
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                {user.role}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => router.push("/admin/site-management")}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={loading}
                            className="bg-[#006798] hover:bg-[#005a87]"
                        >
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
