
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking user_account_roles schema...');
    const { data, error } = await supabase.from('user_account_roles').select('*').limit(1);

    if (error) {
        console.log('Error:', error.message);
    } else if (data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
    } else {
        console.log('Table is empty, cannot infer columns easily. Trying to insert dummy to get error hint.');
        const { error: insertError } = await supabase.from('user_account_roles').insert({ user_id: 'dummy' });
        console.log('Insert Error Hint:', insertError?.message);
    }
}

checkSchema();
