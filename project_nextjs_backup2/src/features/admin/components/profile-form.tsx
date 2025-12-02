"use client";

import { useState, useTransition } from "react";
import { updateUserProfile } from "../actions/users";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

export function ProfileForm({ user, onSuccess }: Props) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // State to hold form values across tabs
    const [formData, setFormData] = useState({
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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="identity">Identity</TabsTrigger>
                    <TabsTrigger value="contact">Contact</TabsTrigger>
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="public">Public</TabsTrigger>
                    <TabsTrigger value="password">Password</TabsTrigger>
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
            </Tabs>

            <div className="flex justify-end gap-4">
                <Button type="submit" disabled={isPending} className="bg-[#006798] hover:bg-[#005a87]">
                    {isPending ? "Saving..." : "Save Profile"}
                </Button>
            </div>
        </form>
    );
}
