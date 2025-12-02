
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSiteSettings() {
    console.log('Checking site_settings table...');
    const { data, error } = await supabase.from('site_settings').select('*').limit(1);

    if (error) {
        console.log(`Error: ${error.message}`);
    } else {
        console.log('Table exists. Columns:', data && data.length > 0 ? Object.keys(data[0]) : '(Table empty)');
    }
}

checkSiteSettings();
