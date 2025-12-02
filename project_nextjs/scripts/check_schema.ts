
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    const { data, error } = await supabase
        .from('review_assignments')
        .insert({
            id: '00000000-0000-0000-0000-000000000001', // Dummy ID
            submission_id: '00000000-0000-0000-0000-000000000000',
            reviewer_id: '00000000-0000-0000-0000-000000000000',
            review_round_id: '00000000-0000-0000-0000-000000000000',
            stage_id: 3,
            date_assigned: new Date().toISOString(),
            competing_interest: 'Test'
        })
        .select();

    if (error) {
        console.error('Error querying review_rounds:', error);
    } else {
        console.log('review_rounds data:', JSON.stringify(data, null, 2));
    }
}

checkSchema();
