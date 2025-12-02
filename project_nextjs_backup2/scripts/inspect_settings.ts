
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from 'fs';

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync('settings_inspection.log', msg + '\n');
}

async function inspectSettings() {
    fs.writeFileSync('settings_inspection.log', 'Starting settings inspection...\n');
    log("Inspecting journal_settings...");

    const { data: settings, error } = await supabase
        .from("journal_settings")
        .select("*")
        .limit(10);

    if (error) {
        log("Error: " + JSON.stringify(error));
    } else {
        log("Settings sample: " + JSON.stringify(settings, null, 2));
    }
}

inspectSettings();
