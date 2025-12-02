
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRpc() {
    console.log('Checking for admin_create_journal RPC...');
    try {
        // Try to call it with dummy data to see if it exists (it might error on logic, but not on "function not found")
        const { data, error } = await supabase.rpc('admin_create_journal', {
            p_path: 'test-rpc-check',
            p_enabled: false,
            p_settings: []
        });

        if (error) {
            console.log(`RPC Error: ${error.message}`);
            if (error.code === '42883') { // Undefined function
                console.log('Result: RPC does NOT exist.');
            } else {
                console.log('Result: RPC exists (but might have failed logic).');
            }
        } else {
            console.log('Result: RPC exists and executed successfully.');
            // Cleanup if it actually created something
            if (data) {
                console.log('Cleaning up test journal...');
                await supabase.from('journals').delete().eq('id', data);
            }
        }
    } catch (e) {
        console.log('Exception:', e);
    }
}

checkRpc();
