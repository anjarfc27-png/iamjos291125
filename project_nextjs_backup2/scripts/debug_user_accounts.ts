import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugUserAccounts() {
    console.log('Debugging user_accounts schema...');

    // Try to select one record
    const { data, error } = await supabase.from('user_accounts').select('*').limit(1);

    if (error) {
        console.error('Error selecting from user_accounts:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns found:', Object.keys(data[0]));
    } else {
        console.log('No data found, but select worked. Trying to insert dummy to see error...');
        // We can't easily discover columns if table is empty without information_schema access.
        // But we can try to insert with minimal fields and catch the specific error.
    }
}

debugUserAccounts();
