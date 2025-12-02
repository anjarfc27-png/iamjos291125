"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "../actions/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

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
    onSuccess?: (message: string) => void;
};

const NOTIFICATION_OPTIONS = [
    {
        category: "Public Announcements",
        items: [
            { id: "notification_new_announcement", label: "New announcement." },
            { id: "notification_issue_published", label: "An issue has been published." },
        ]
    },
    {
        category: "Submission Events",
        items: [
            { id: "notification_article_submitted", label: 'A new article, "Title," has been submitted.' },
            { id: "notification_editor_assignment", label: 'A new article has been submitted to which an editor needs to be assigned.' },
            { id: "notification_metadata_modified", label: '"Title\'s" metadata has been modified.' },
            { id: "notification_discussion_added", label: 'Discussion added.' },
            { id: "notification_discussion_activity", label: 'Discussion activity.' },
        ]
    },
    {
        category: "Reviewing Events",
        items: [
            { id: "notification_reviewer_comment", label: 'A reviewer has commented on "Title".' },
        ]
    },
    {
        category: "Editors",
        items: [
            { id: "notification_statistics_report", label: 'Statistics report summary.' },
        ]
    }
];

export function ProfileForm({ user, onSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // State to hold form values across tabs
    const [formData, setFormData] = useState(() => {
        const initialData: Record<string, string> = {
            firstName: user.first_name || "",
            lastName: user.last_name || "",
            preferredName: user.settings.preferredName || "",
            email: user.email || "",
            phone: user.settings.phone || "",
            affiliation: user.settings.affiliation || "",
            mailingAddress: user.settings.mailingAddress || "",
            country: user.settings.country || "",
            username: user.username || "",
            url: user.settings.url || "",
            orcid: user.settings.orcid || "",
            biography: user.settings.biography || "",
            password: "",
            apiKeyEnabled: user.settings.apiKeyEnabled || "false",
            generateNewApiKey: "false",
        };

        // Initialize notification settings
        NOTIFICATION_OPTIONS.forEach(category => {
            category.items.forEach(item => {
                // Default to "true" for enabled, "false" for disable email if not set
                initialData[`${item.id}_enable`] = user.settings[`${item.id}_enable`] || "true";
                initialData[`${item.id}_email`] = user.settings[`${item.id}_email`] || "false";
            });
        });

        return initialData;
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData(prev => ({ ...prev, [name]: checked ? "true" : "false" }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const payload = new FormData();
        payload.append("userId", user.id);
        Object.entries(formData).forEach(([key, value]) => {
            payload.append(key, value);
        });

        startTransition(async () => {
            const result = await updateUserProfile(payload);
            if (result.success) {
                toast.success(result.message);
                if (onSuccess) onSuccess(result.message);
            } else {
                setError(result.message);
                toast.error(result.message);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                    {error}
                </div>
            )}

            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="identity">Identity</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="public">Public</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="apikey">API Key</TabsTrigger>
                </TabsList>

                {/* Identity Tab */}
                <TabsContent value="identity">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">Given Name *</Label>
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Family Name</Label>
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="preferredName">Preferred Public Name</Label>
                                <Input
                                    id="preferredName"
                                    name="preferredName"
                                    value={formData.preferredName}
                                    onChange={handleChange}
                                    placeholder="How you prefer to be addressed"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Contact Tab */}
                <TabsContent value="contact">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="affiliation">Affiliation</Label>
                                <Textarea
                                    id="affiliation"
                                    name="affiliation"
                                    value={formData.affiliation}
                                    onChange={handleChange}
                                    placeholder="Your institution or organization"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="mailingAddress">Mailing Address</Label>
                                <Textarea
                                    id="mailingAddress"
                                    name="mailingAddress"
                                    value={formData.mailingAddress}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input
                                    id="country"
                                    name="country"
                                    value={formData.country}
                                    onChange={handleChange}
                                    placeholder="e.g. Indonesia"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Roles Tab (Read Only for now) */}
                <TabsContent value="roles">
                    <Card>
                        <CardContent className="pt-4">
                            <p className="text-sm text-gray-500 mb-4">
                                Your current roles in the system. To change roles, please contact a Site Administrator.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                    Site Administrator
                                </span>
                                {/* We could fetch and map real roles here if passed in props */}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Public Tab */}
                <TabsContent value="public">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username *</Label>
                                <Input
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="url">Homepage URL</Label>
                                <Input
                                    id="url"
                                    name="url"
                                    type="url"
                                    value={formData.url}
                                    onChange={handleChange}
                                    placeholder="https://"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="orcid">ORCID iD</Label>
                                <Input
                                    id="orcid"
                                    name="orcid"
                                    value={formData.orcid}
                                    onChange={handleChange}
                                    placeholder="https://orcid.org/..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="biography">Bio Statement</Label>
                                <Textarea
                                    id="biography"
                                    name="biography"
                                    value={formData.biography}
                                    onChange={handleChange}
                                    className="h-32"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Password Tab */}
                <TabsContent value="password">
                    <Card>
                        <CardContent className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current password"
                                />
                                <p className="text-xs text-gray-500">Must be at least 8 characters.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications">
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <p className="text-sm text-gray-600">
                                Select the system events that you wish to be notified about. Unchecking an item will prevent notifications of the event from showing up in the system and also from being emailed to you. Checked events will appear in the system and you have an extra option to receive or not the same notification by email.
                            </p>

                            {NOTIFICATION_OPTIONS.map((category) => (
                                <div key={category.category} className="space-y-4">
                                    <h3 className="font-bold text-gray-900">{category.category}</h3>
                                    <div className="space-y-6">
                                        {category.items.map((item) => (
                                            <div key={item.id} className="space-y-2">
                                                <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${item.id}_enable`}
                                                        checked={formData[`${item.id}_enable`] === "true"}
                                                        onChange={(e) => handleCheckboxChange(`${item.id}_enable`, e.target.checked)}
                                                    />
                                                    <Label htmlFor={`${item.id}_enable`} className="font-normal text-gray-700">Enable these types of notifications.</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`${item.id}_email`}
                                                        checked={formData[`${item.id}_email`] === "true"}
                                                        onChange={(e) => handleCheckboxChange(`${item.id}_email`, e.target.checked)}
                                                    />
                                                    <Label htmlFor={`${item.id}_email`} className="font-normal text-gray-700">Do not send me an email for these types of notifications.</Label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4">
                                <p className="text-sm text-gray-600">
                                    Your data is stored in accordance with our <a href="#" className="text-[#006798] hover:underline">privacy statement</a>.
                                </p>
                            </div>
                            <div className="bg-gray-100 p-3 text-sm text-gray-600 italic">
                                Required fields are marked with an asterisk: *
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* API Key Tab */}
                <TabsContent value="apikey">
                    <Card>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="apiKeyEnabled"
                                        checked={formData.apiKeyEnabled === "true"}
                                        onChange={(e) => handleCheckboxChange("apiKeyEnabled", e.target.checked)}
                                        className="mt-1"
                                    />
                                    <Label htmlFor="apiKeyEnabled" className="font-normal text-gray-700 leading-normal">
                                        Enable external applications with the API key to access this account
                                    </Label>
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="generateNewApiKey"
                                        checked={formData.generateNewApiKey === "true"}
                                        onChange={(e) => handleCheckboxChange("generateNewApiKey", e.target.checked)}
                                        className="mt-1"
                                    />
                                    <Label htmlFor="generateNewApiKey" className="font-normal text-gray-700 leading-normal">
                                        Generate new API key
                                    </Label>
                                </div>

                                <div className="pt-2">
                                    <p className="text-sm text-gray-700 mb-2">
                                        Generating a new API key will invalidate any existing key for this user.
                                    </p>
                                    <Input
                                        value={user.settings.apiKey || "None"}
                                        readOnly
                                        className="bg-gray-50 text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1 italic">API Key</p>
                                </div>

                                <div className="pt-4">
                                    <p className="text-sm text-gray-600">
                                        Your data is stored in accordance with our <a href="#" className="text-[#006798] hover:underline">privacy statement</a>.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isPending} className="bg-[#006798] hover:bg-[#005a87]">
                    {isPending ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
