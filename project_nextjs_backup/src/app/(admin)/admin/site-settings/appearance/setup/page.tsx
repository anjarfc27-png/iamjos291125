import { getSiteAppearanceSetup, updateSiteAppearanceSetupAction } from "../../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// OJS 3.3 PKPSiteAppearanceForm does not have separate theme tab
// Redirect to setup page which contains the actual appearance settings
const SIDEBAR_OPTIONS = [
  { value: "administration", label: "Administration Block" },
  { value: "user", label: "User Block" },
  { value: "language", label: "Language Toggle Block" },
  { value: "navigation", label: "Navigation Block" },
  { value: "announcements", label: "Announcements Block" },
];

const THEME_OPTIONS = [
  { value: "default", label: "Default Theme" },
  { value: "dark", label: "Dark Theme" },
  { value: "classic", label: "Classic OJS" },
];

export default async function AppearanceSetupPage() {
  const setup = await getSiteAppearanceSetup();

  return (
    <div className="font-sans">
      <header className="px-6 py-4 bg-gray-50 border-b mb-6">
        <h2 className="text-base font-semibold text-[#002C40] m-0">
          Setup
        </h2>
      </header>

      <form action={updateSiteAppearanceSetupAction} className="flex flex-col gap-6 max-w-3xl px-6 pb-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <Label htmlFor="theme" className="text-[#002C40]">Theme</Label>
          <select
            id="theme"
            name="theme"
            defaultValue={setup.theme || "default"}
            className="w-full max-w-md px-3 py-2 border rounded-md text-sm"
          >
            {THEME_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Select the visual theme for the site.
          </p>
        </div>

        {/* Logo Upload */}
        <div className="space-y-3">
          <Label htmlFor="pageHeaderTitleImage" className="text-[#002C40]">Logo</Label>
          <Input
            id="pageHeaderTitleImage"
            name="pageHeaderTitleImage"
            type="text"
            defaultValue={setup.pageHeaderTitleImage || ""}
            placeholder="Enter logo URL or path (file upload will be implemented)"
            className="max-w-md"
          />
          <p className="text-xs text-gray-500">
            URL or path to the logo image to display in the page header. In OJS 3.3 this is a multilingual FieldUploadImage.
          </p>
          {setup.pageHeaderTitleImage && (
            <div className="mt-2 p-2 border rounded bg-gray-50 inline-block">
              <img
                src={setup.pageHeaderTitleImage}
                alt="Logo preview"
                className="h-20 object-contain"
              />
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div className="space-y-3">
          <Label htmlFor="pageFooter" className="text-[#002C40]">Page footer</Label>
          <Textarea
            id="pageFooter"
            name="pageFooter"
            defaultValue={setup.pageFooter || ""}
            rows={6}
            placeholder="Enter footer content (HTML allowed)"
            className="max-w-2xl"
          />
          <p className="text-xs text-gray-500">
            Content to display in the page footer. HTML is allowed. In OJS 3.3 this is a multilingual FieldRichTextarea.
          </p>
        </div>

        {/* Sidebar Blocks */}
        <div className="space-y-3">
          <Label className="text-[#002C40]">Sidebar</Label>
          <p className="text-xs text-gray-500 mb-2">
            Select which blocks to display in the sidebar. In OJS 3.3 this is orderable (drag & drop).
          </p>
          <div className="border rounded-md p-4 max-w-md space-y-2 bg-white">
            {SIDEBAR_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded"
              >
                <input
                  type="checkbox"
                  name="sidebar"
                  value={option.value}
                  defaultChecked={setup.sidebar.includes(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-[#006798] focus:ring-[#006798]"
                />
                <span className="text-sm text-[#002C40] font-medium">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Stylesheet */}
        <div className="space-y-3">
          <Label htmlFor="styleSheet" className="text-[#002C40]">Custom stylesheet</Label>
          <Input
            id="styleSheet"
            name="styleSheet"
            type="text"
            defaultValue={setup.styleSheet || ""}
            placeholder="Enter stylesheet URL or path (file upload will be implemented)"
            className="max-w-md"
          />
          <p className="text-xs text-gray-500">
            URL or path to a custom CSS file to override default styles. In OJS 3.3 this is a FieldUpload that accepts .css files only.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button type="submit" className="bg-[#006798] hover:bg-[#005a87]">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
