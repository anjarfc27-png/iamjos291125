import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log("Checking storage buckets...");
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error.message);
        return;
    }

    const bucketName = "site-assets";
    const existing = buckets.find(b => b.name === bucketName);

    if (existing) {
        console.log(`Bucket '${bucketName}' already exists.`);
    } else {
        console.log(`Bucket '${bucketName}' not found. Creating...`);
        const { data, error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'text/css']
        });

        if (createError) {
            console.error(`Failed to create bucket '${bucketName}':`, createError.message);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    }
}

setupStorage();
