
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMetadata() {
    const authId = 'cff38119-7986-47d5-9d76-b9862848a8ad';
    console.log(`Fixing metadata for ${authId}...`);

    const { data: { user }, error } = await supabase.auth.admin.updateUserById(
        authId,
        {
            user_metadata: {
                user_id: authId, // Point to ITSELF (the correct ID)
                username: "admin",
                first_name: "Site",
                last_name: "Administrator"
            }
        }
    );

    if (error) {
        console.log('Error:', error.message);
    } else {
        console.log('Metadata updated successfully!');
        console.log('New Metadata:', JSON.stringify(user.user_metadata, null, 2));
    }
}

fixMetadata();
