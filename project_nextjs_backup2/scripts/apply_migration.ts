import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!dbUrl) {
    console.error('Error: DATABASE_URL or POSTGRES_URL not found in environment.');
    process.exit(1);
}

const migrationFile = path.join(process.cwd(), 'supabase', 'migrations', '20251129_atomic_operations.sql');

async function applyMigration() {
    console.log(`Reading migration file: ${migrationFile}`);
    const sql = fs.readFileSync(migrationFile, 'utf8');

    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Required for Supabase in many cases
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        console.log('Applying migration...');
        await client.query(sql);
        console.log('Migration applied successfully.');

    } catch (err) {
        console.error('Error applying migration:', err);
    } finally {
        await client.end();
    }
}

applyMigration();
