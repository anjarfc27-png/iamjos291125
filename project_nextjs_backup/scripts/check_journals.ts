
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkJournals() {
    console.log('Checking journals...');
    const { data, error } = await supabase.from('journals').select('*');

    if (error) {
        console.error('Error fetching journals:', error);
        return;
    }

    console.error(`Found ${data.length} journals.`);
    data.forEach(j => {
        console.error(`- [${j.id}] ${j.name || j.title} (Enabled: ${j.enabled}, Public: ${j.is_public})`);
    });
}

checkJournals();
