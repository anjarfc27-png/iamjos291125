
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugSubmissions() {
    console.log('Debugging Submissions Table...');

    const { data, error } = await supabase
        .from('submissions')
        .select('*');

    if (error) {
        console.error('Error fetching submissions:', error);
    } else {
        console.log(`Found ${data.length} submissions.`);
        console.log(JSON.stringify(data, null, 2));
    }
}

debugSubmissions();
