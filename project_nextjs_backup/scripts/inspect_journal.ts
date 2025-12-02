
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectJournal() {
    const { data, error } = await supabase.from('journals').select('*').limit(1).single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.error('Journal Row Keys:', Object.keys(data));
    console.error('Journal Row Data:', JSON.stringify(data, null, 2));
}

inspectJournal();
