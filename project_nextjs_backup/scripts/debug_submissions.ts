
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSubmissions() {
    console.log("Checking submissions table...");

    // 1. Try to select just ID
    console.log("\n1. Selecting ID only:");
    const { data: ids, error: idError } = await supabase
        .from("submissions")
        .select("id")
        .limit(1);

    if (idError) {
        console.error("Error selecting ID:", idError);
    } else {
        console.log("Success selecting ID:", ids);
    }

    // 2. Try to select Title
    console.log("\n2. Selecting Title:");
    const { data: titles, error: titleError } = await supabase
        .from("submissions")
        .select("title")
        .limit(1);

    if (titleError) {
        console.error("Error selecting Title:", titleError);
    } else {
        console.log("Success selecting Title:", titles);
    }

    // 3. Try to select *
    console.log("\n3. Selecting *:");
    const { data: all, error: allError } = await supabase
        .from("submissions")
        .select("*")
        .limit(1);

    if (allError) {
        console.error("Error selecting *:", allError);
    } else {
        console.log("Success selecting * (keys):", all && all.length > 0 ? Object.keys(all[0]) : "No data");
    }
}

checkSubmissions();
