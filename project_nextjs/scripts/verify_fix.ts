import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyGetEnabledJournals() {
    console.log("Verifying getEnabledJournals logic...");

    try {
        // 1. Fetch journals (without title)
        const { data: journals, error } = await supabase
            .from("journals")
            .select("id,path,enabled")
            .eq("enabled", true)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Step 1 Failed:", error.message);
            fs.writeFileSync('verification_result.txt', `FAILED: Step 1 - ${error.message}`);
            return;
        }
        console.log(`Step 1 Success: Found ${journals.length} enabled journals.`);

        if (journals.length === 0) {
            console.log("No journals to map. Logic is safe.");
            fs.writeFileSync('verification_result.txt', "VERIFICATION PASSED (No journals)");
            return;
        }

        // 2. Fetch journal names from settings
        const journalIds = journals.map(j => j.id);
        const { data: settings, error: settingsError } = await supabase
            .from("journal_settings")
            .select("journal_id, setting_value")
            .in("journal_id", journalIds)
            .eq("setting_name", "name");

        if (settingsError) {
            console.error("Step 2 Failed:", settingsError.message);
            fs.writeFileSync('verification_result.txt', `FAILED: Step 2 - ${settingsError.message}`);
            return;
        }
        console.log(`Step 2 Success: Found ${settings.length} name settings.`);

        // 3. Map names
        const nameMap = new Map(settings?.map(s => [s.journal_id, s.setting_value]) || []);

        const result = journals.map((j: any) => ({
            id: String(j.id),
            name: String(nameMap.get(j.id) || j.path || j.id),
        }));

        const logMsg = `Step 3 Success: Mapped results sample: ${JSON.stringify(result.slice(0, 2))}\nVERIFICATION PASSED`;
        console.log(logMsg);
        fs.writeFileSync('verification_result.txt', logMsg);

    } catch (e: any) {
        console.error("Verification Failed with Exception:", e.message);
        fs.writeFileSync('verification_result.txt', `FAILED: Exception - ${e.message}`);
    }
}

verifyGetEnabledJournals();
