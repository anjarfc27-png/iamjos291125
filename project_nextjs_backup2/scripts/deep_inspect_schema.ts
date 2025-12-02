
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
    fs.appendFileSync('deep_schema_inspection.log', msg + '\n');
}

async function inspect() {
    fs.writeFileSync('deep_schema_inspection.log', 'Starting deep inspection...\n');

    // 1. Inspect submissions table columns (by fetching one row)
    log("\n--- Submissions Table ---");
    const { data: subs, error: subsError } = await supabase
        .from("submissions")
        .select("*")
        .limit(1);

    if (subsError) {
        log("Error fetching submissions: " + JSON.stringify(subsError));
    } else if (subs && subs.length > 0) {
        log("Submissions Columns: " + Object.keys(subs[0]).join(", "));
    } else {
        log("Submissions table empty or no access. Trying to insert a dummy to check columns? No, too risky.");
        // Try to select specific columns to see which ones fail
        const cols = ['id', 'title', 'locale', 'submission_progress'];
        for (const col of cols) {
            const { error } = await supabase.from("submissions").select(col).limit(1);
            log(`Column '${col}' exists? ${error ? 'NO (' + error.message + ')' : 'YES'}`);
        }
    }

    // 2. Inspect publications table (OJS 3.3 stores titles here)
    log("\n--- Publications Table ---");
    const { data: pubs, error: pubsError } = await supabase
        .from("publications")
        .select("*")
        .limit(1);

    if (pubsError) {
        log("Error fetching publications: " + JSON.stringify(pubsError));
    } else if (pubs && pubs.length > 0) {
        log("Publications Columns: " + Object.keys(pubs[0]).join(", "));
    } else {
        log("Publications table empty or no access.");
        const cols = ['id', 'submission_id', 'title', 'status'];
        for (const col of cols) {
            const { error } = await supabase.from("publications").select(col).limit(1);
            log(`Column '${col}' exists? ${error ? 'NO (' + error.message + ')' : 'YES'}`);
        }
    }

    // 3. Inspect submission_settings table
    log("\n--- Submission Settings Table ---");
    const { data: settings, error: settingsError } = await supabase
        .from("submission_settings")
        .select("*")
        .limit(5);

    if (settingsError) {
        log("Error fetching submission_settings: " + JSON.stringify(settingsError));
    } else if (settings && settings.length > 0) {
        log("Submission Settings Columns: " + Object.keys(settings[0]).join(", "));
        log("Sample Settings: " + JSON.stringify(settings, null, 2));
    } else {
        log("Submission Settings table empty or no access.");
    }
}

inspect();
