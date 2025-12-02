import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import Link from "next/link";
import { Settings as SettingsIcon, Workflow, Globe, Truck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const settingsCategories = [
  {
    id: "workflow",
    title: "Workflow",
    description: "Configure submission, review, and publication workflow",
    icon: Workflow,
    href: "/manager/settings/workflow",
  },
  {
    id: "website",
    title: "Website",
    description: "Manage website appearance, navigation, and languages",
    icon: Globe,
    href: "/manager/settings/website",
  },
  {
    id: "distribution",
    title: "Distribution",
    description: "Configure indexing, metadata, and access settings",
    icon: Truck,
    href: "/manager/settings/distribution",
  },
  {
    id: "access",
    title: "Access",
    description: "Manage user registration, login, and permissions",
    icon: Lock,
    href: "/manager/settings/access",
  },
];

export default async function ManagerSettingsPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Journal Settings</h1>
          <p className="text-sm text-gray-600 mt-1">Configure your journal's settings and preferences</p>
        </div>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            color: "#006798",
            backgroundColor: "transparent",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            padding: "0.25rem 0.5rem",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "14px",
              height: "14px",
              borderRadius: "50%",
              backgroundColor: "#006798",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            i
          </span>
          Help
        </button>
      </div>

      {/* Settings Categories */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link key={category.id} href={category.href}>
              <Card className="border border-gray-200 hover:border-[#006798] transition-colors cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#006798] bg-opacity-10 rounded-md">
                      <Icon className="h-6 w-6 text-[#006798]" />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {category.title}
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-2">{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Quick Links */}
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            <Link
              href="/manager/settings/workflow"
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">Workflow Settings</div>
              <div className="text-xs text-gray-500 mt-1">
                Configure submission stages, review process, and publication workflow
              </div>
            </Link>
            <Link
              href="/manager/settings/website"
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">Website Settings</div>
              <div className="text-xs text-gray-500 mt-1">
                Customize journal website appearance, navigation, and languages
              </div>
            </Link>
            <Link
              href="/manager/settings/distribution"
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">Distribution Settings</div>
              <div className="text-xs text-gray-500 mt-1">
                Configure indexing, metadata, and access control settings
              </div>
            </Link>
            <Link
              href="/manager/settings/access"
              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900 text-sm">Access Settings</div>
              <div className="text-xs text-gray-500 mt-1">
                Manage user registration, login, and role permissions
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


