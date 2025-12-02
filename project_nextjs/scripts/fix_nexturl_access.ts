
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function fixNextUrlAccess() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Replace request.nextUrl with (request as any).nextUrl
        // Handle cases where it might already be casted or different
        // We look for "request.nextUrl" specifically

        // Use regex to avoid replacing if already casted
        // Look for "request.nextUrl" not preceded by "as any)" or "as NextRequest)"

        // Simple replacement:
        content = content.replace(/([^a-zA-Z0-9_])request\.nextUrl/g, '$1(request as any).nextUrl');

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`Fixed nextUrl in: ${path.relative(process.cwd(), file)}`);
            fixedCount++;
        }
    }

    console.log(`\nDone. Fixed nextUrl in ${fixedCount} files.`);
}

fixNextUrlAccess().catch(console.error);
