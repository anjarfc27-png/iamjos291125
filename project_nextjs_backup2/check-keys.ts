
import { readFileSync } from 'fs';
import { join } from 'path';

const envPath = join(process.cwd(), '.env.local');
console.log('Reading .env.local from:', envPath);

try {
    const envContent = readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    let fileServiceKey = '';
    let fileAnonKey = '';

    lines.forEach(line => {
        if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
            fileServiceKey = line.split('=')[1].trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            fileAnonKey = line.split('=')[1].trim();
        }
    });

    console.log('--- FILE CONTENT CHECK ---');
    console.log('Service Key found in file length:', fileServiceKey.length);
    console.log('Anon Key found in file length:   ', fileAnonKey.length);
    console.log('Service Key (last 10):', fileServiceKey.slice(-10));
    console.log('Anon Key    (last 10):', fileAnonKey.slice(-10));

    if (fileServiceKey === fileAnonKey) {
        console.log('RESULT: Keys are IDENTICAL in the file.');
    } else {
        console.log('RESULT: Keys are DIFFERENT in the file.');
    }
    console.log('--------------------------');

} catch (error) {
    console.error('Error reading file:', error);
}
