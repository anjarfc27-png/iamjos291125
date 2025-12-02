import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';


const supabaseUrl = 'https://abcjyjmaaiutnnadwftz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2p5am1hYWl1dG5uYWR3ZnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjkwNjkxNCwiZXhwIjoyMDc4NDgyOTE0fQ.FDOKSghx_kpDEnxAgZXWtrIqCOR8HszGB8zaDM4i-JY';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixSplitBrain() {
    console.log('🧠 Starting Split-Brain Fix (Role Sync)...\n');

    // Call the Sync Function directly (User applied migration manually)
    console.log('🔄 Calling admin_sync_roles()...');
    const { error } = await supabase.rpc('admin_sync_roles');

    if (error) {
        console.error('❌ Error calling admin_sync_roles:', error.message);
    } else {
        console.log('✅ admin_sync_roles() executed successfully.');
        console.log('   Legacy roles have been synced to OJS tables.');
    }
}

fixSplitBrain();
