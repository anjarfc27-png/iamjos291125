
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function resetPassword(email: string, newPassword: string) {
    console.log(`Resetting password for ${email}...`);

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user_accounts table
    const { data, error } = await supabase
        .from('user_accounts')
        .update({ password: hashedPassword })
        .eq('email', email)
        .select();

    if (error) {
        console.error('Error updating password:', error);
        return;
    }

    if (!data || data.length === 0) {
        console.error('User not found!');
        return;
    }

    console.log(`Password for ${email} has been reset to: ${newPassword}`);
}

// Reset admin password
resetPassword('admin@ojs.test', 'password');
