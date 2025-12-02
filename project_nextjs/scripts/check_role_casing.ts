
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkRoleCasing() {
    const { data: users } = await supabase
        .from('user_accounts')
        .select('id')
        .eq('email', 'admin@ojs.test')
        .single();

    if (!users) {
        console.log('User not found');
        return;
    }

    const { data: roles } = await supabase
        .from('user_account_roles')
        .select('role_name')
        .eq('user_id', users.id);

    console.log('Exact Role Names:', JSON.stringify(roles, null, 2));
}

checkRoleCasing();
