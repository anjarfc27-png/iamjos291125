
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
    fs.appendFileSync('auth_probe.log', msg + '\n');
}

async function probeAuth() {
    fs.writeFileSync('auth_probe.log', 'Starting auth probe...\n');

    const tables = [
        'user_accounts',
        'user_account_roles',
        'user_user_groups',
        'user_groups',
        'users' // Check if the old users table exists just in case
    ];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            log(`Table '${table}': ERROR (${error.message})`);
        } else {
            log(`Table '${table}': OK (Count: ${count})`);
        }
    }
}

probeAuth();
