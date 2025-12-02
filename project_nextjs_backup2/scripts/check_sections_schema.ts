
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSectionsSchema() {
    console.log('Checking sections table...');
    const { data, error } = await supabase.from('sections').select('*').limit(1);

    if (error) {
        console.log(`Error: ${error.message}`);
    } else {
        console.log('Table exists. Columns:', data && data.length > 0 ? Object.keys(data[0]) : '(Table empty, cannot determine columns easily without introspection)');

        // Try to insert a dummy row with title to see if it errors
        const { error: insertError } = await supabase.from('sections').insert({
            journal_id: '00000000-0000-0000-0000-000000000000', // Invalid ID, should fail FK but pass column check if column exists
            title: 'Test'
        });

        if (insertError) {
            console.log('Insert check result:', insertError.message);
        }
    }
}

checkSectionsSchema();
