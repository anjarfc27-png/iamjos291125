import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function inspectFK() {
    console.log("Inspecting FKs for user_user_groups...");

    const { data, error } = await supabase.rpc('get_foreign_keys', { table_name: 'user_user_groups' });

    if (error) {
        // Fallback to direct query if RPC doesn't exist (it likely doesn't)
        console.log("RPC failed, trying manual check via error message...");
        // We can't query information_schema easily via supabase-js client unless we have a function for it.
        // But we can try to insert and catch the error details.

        const { error: insertError } = await supabase.from('user_user_groups').insert({
            user_group_id: '00000000-0000-0000-0000-000000000000',
            user_id: '00000000-0000-0000-0000-000000000000'
        });
        console.log("Insert Error Details:", insertError);
    } else {
        console.log("FKs:", data);
    }
}

inspectFK();
