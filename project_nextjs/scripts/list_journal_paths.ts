
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function listJournalPaths() {
    const { data: journals, error } = await supabase
        .from('journals')
        .select('path')
        .eq('enabled', true);

    if (error) {
        console.error('Error fetching journals:', error);
        return;
    }

    console.log('Valid Journal Paths:');
    journals.forEach(j => console.log(j.path));
}

listJournalPaths();
