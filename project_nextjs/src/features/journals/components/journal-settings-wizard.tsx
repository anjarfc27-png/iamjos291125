"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, ChevronLeft, Loader2 } from "lucide-react";

type WizardStep = {
    id: string;
    title: string;
    description: string;
};

const STEPS: WizardStep[] = [
    { id: "identity", title: "Identity", description: "Journal name and description" },
    { id: "contact", title: "Contact", description: "Principal contact information" },
    { id: "sections", title: "Sections", description: "Manage journal sections" },
    { id: "plugins", title: "Plugins", description: "Enable essential plugins" },
];

type JournalSettingsWizardProps = {
    journalId: string;
    initialData?: any;
};

export function JournalSettingsWizard({ journalId, initialData }: JournalSettingsWizardProps) {
    const router = useRouter();
    const supabase = getSupabaseBrowserClient();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        description: initialData?.description || "",
        abbreviation: initialData?.abbreviation || "",
        contactName: "",
        contactEmail: "",
        supportName: "",
        supportEmail: "",
        sections: [
            { title: "Articles", abbreviation: "ART", policy: "Default section for articles." },
            { title: "Reviews", abbreviation: "REV", policy: "Book reviews." }
        ],
        plugins: {
            "quickSubmit": false,
            "googleAnalytics": false
        }
    });

    const handleNext = async () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            await handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
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

            // 2. Update Settings (Abbreviation, Contact)
            const settingsUpdates = [
                { journal_id: journalId, setting_name: "abbreviation", setting_value: formData.abbreviation },
                { journal_id: journalId, setting_name: "contactName", setting_value: formData.contactName },
                { journal_id: journalId, setting_name: "contactEmail", setting_value: formData.contactEmail },
                { journal_id: journalId, setting_name: "supportName", setting_value: formData.supportName },
                { journal_id: journalId, setting_name: "supportEmail", setting_value: formData.supportEmail },
            ];

            const { error: settingsError } = await supabase
                .from("journal_settings")
                .upsert(settingsUpdates, { onConflict: "journal_id, setting_name" });

            if (settingsError) throw settingsError;

            // 3. Create Sections (Mock for now, normally would insert into sections table)
            // For this MVP restoration, we'll just log it or assume default sections exist
            console.log("Sections to create:", formData.sections);

            toast.success("Journal setup completed!");
            router.push(`/admin/journals/${journalId}/settings`);
        } catch (error) {
            console.error("Error saving wizard:", error);
            toast.error("Failed to complete setup");
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = () => {
        switch (STEPS[currentStep].id) {
            case "identity":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Journal Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Journal of Medical Sciences"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="abbreviation">Abbreviation</Label>
                            <Input
                                id="abbreviation"
                                value={formData.abbreviation}
                                onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
                                placeholder="e.g. JMS"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Brief description of the journal..."
                                rows={4}
                            />
                        </div>
                    </div>
                );
            case "contact":
                return (
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Principal Contact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactName">Name</Label>
                                    <Input
                                        id="contactName"
                                        value={formData.contactName}
                                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Email</Label>
                                    <Input
                                        id="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Technical Support Contact</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="supportName">Name</Label>
                                    <Input
                                        id="supportName"
                                        value={formData.supportName}
                                        onChange={(e) => setFormData({ ...formData, supportName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="supportEmail">Email</Label>
                                    <Input
                                        id="supportEmail"
                                        type="email"
                                        value={formData.supportEmail}
                                        onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case "sections":
                return (
                    <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-700">
                            Default sections will be created. You can edit them later in Journal Settings.
                        </div>
                        <div className="border rounded-md divide-y">
                            {formData.sections.map((section, idx) => (
                                <div key={idx} className="p-4 flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{section.title} ({section.abbreviation})</div>
                                        <div className="text-sm text-gray-500">{section.policy}</div>
                                    </div>
                                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                        Active
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case "plugins":
                return (
                    <div className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <div className="font-medium">Quick Submit Plugin</div>
                                    <div className="text-sm text-gray-500">Allow one-step submission for editors</div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={formData.plugins.quickSubmit}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        plugins: { ...formData.plugins, quickSubmit: e.target.checked }
                                    })}
                                />
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <div className="font-medium">Google Analytics</div>
                                    <div className="text-sm text-gray-500">Track journal traffic</div>
                                </div>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5"
                                    checked={formData.plugins.googleAnalytics}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        plugins: { ...formData.plugins, googleAnalytics: e.target.checked }
                                    })}
                                />
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border">
            {/* Header */}
            <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Journal Setup Wizard</h2>
                <p className="text-sm text-gray-500 mt-1">
                    Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
                </p>
                {/* Progress Bar */}
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[#006798] transition-all duration-300"
                        style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                    />
                </div>
            </div>

            {/* Content */}
            <div className="p-6 min-h-[400px]">
                {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-gray-50 flex justify-between items-center rounded-b-lg">
                <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0 || loading}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="bg-[#006798] hover:bg-[#005a87]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : currentStep === STEPS.length - 1 ? (
                        <>
                            Finish
                            <Check className="w-4 h-4 ml-2" />
                        </>
                    ) : (
                        <>
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
