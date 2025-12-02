
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const tables = ['email_templates', 'navigation_menus', 'review_forms'];
    for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.log(`Error checking ${table}:`, error.message);
        } else {
            console.log(`Success: ${table} exists.`);
        }
    }
}

check();

