
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
    fs.appendFileSync('schema_inspection.log', msg + '\n');
}

async function inspectSchema() {
    fs.writeFileSync('schema_inspection.log', 'Starting inspection...\n');
    log("Inspecting schema...");

    // 1. Check journals columns
    log("\n--- Journals Columns ---");
    const { data: journals, error: journalsError } = await supabase
        .from("journals")
        .select("*")
        .limit(1);

    if (journalsError) {
        log("Error fetching journals: " + JSON.stringify(journalsError));
    } else if (journals && journals.length > 0) {
        log("Columns: " + Object.keys(journals[0]).join(", "));
    } else {
        log("Journals table empty or no access");
    }

    log("\n--- Testing Joins ---");

    // Test 1: Implicit Join
    const { error: error1 } = await supabase
        .from("submissions")
        .select("id, journals(title)")
        .limit(1);
    log("Test 1 (Implicit journals(title)): " + (error1 ? JSON.stringify(error1) : "Success"));

    // Test 2: Explicit FK 'submissions_journal_id_fkey'
    const { error: error2 } = await supabase
        .from("submissions")
        .select("id, journals!submissions_journal_id_fkey(title)")
        .limit(1);
    log("Test 2 (Explicit FK submissions_journal_id_fkey): " + (error2 ? JSON.stringify(error2) : "Success"));

    // Test 3: Explicit FK 'submissions_journal_id_fkey' with alias
    const { error: error3 } = await supabase
        .from("submissions")
        .select("id, journal_info:journals!submissions_journal_id_fkey(title)")
        .limit(1);
    log("Test 3 (Alias + FK): " + (error3 ? JSON.stringify(error3) : "Success"));
}

inspectSchema();
