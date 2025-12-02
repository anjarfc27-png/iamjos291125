
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

async function resetPasswords() {
    const targetEmails = [
        'admin@ojs.test',
        'verify_admin@example.com',
        'verify_manager@example.com',
        'verify_editor@example.com',
        'verify_author@example.com',
        'verify_reviewer@example.com'
    ];

    console.log('Resetting passwords for test accounts to "password"...\n');

    const hashedPassword = await bcrypt.hash('password', 10);

    for (const email of targetEmails) {
        const { data, error } = await supabase
            .from('user_accounts')
            .update({ password: hashedPassword })
            .eq('email', email)
            .select('username');

        if (error) {
            console.error(`Failed to reset ${email}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(`✅ Success: ${email} (${data[0].username})`);
        } else {
            console.log(`⚠️  User not found: ${email}`);
        }
    }
}

resetPasswords().catch(console.error);
