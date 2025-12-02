
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listJournals() {
    const { data: journals, error } = await supabase
        .from('journals')
        .select('*');

    if (error) {
        console.error('Error fetching journals:', error);
        return;
    }

    console.log(`Found ${journals.length} journals.`);
    console.log(JSON.stringify(journals.map(j => ({ id: j.id, path: j.path, enabled: j.enabled })), null, 2));
}

listJournals();
