
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function probeColumns() {
    console.log("Probing 'announcements' table columns...");

    const columnsToProbe = ["id", "context_id", "type_id", "title", "short_description", "description", "date_posted", "date_expire"];

    for (const col of columnsToProbe) {
        const { error } = await supabase.from("announcements").select(col).limit(1);
        if (error) {
            console.log(`Column '${col}' DOES NOT exist or error:`, error.message);
        } else {
            console.log(`Column '${col}' exists.`);
        }
    }
}

probeColumns();
