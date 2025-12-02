
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function removeForceDynamic() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Remove force-dynamic lines
        content = content.replace(/export const dynamic = ['"]force-dynamic['"];?\r?\n?/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`Removed force-dynamic from: ${path.relative(process.cwd(), file)}`);
            fixedCount++;
        }
    }

    console.log(`\nDone. Removed force-dynamic from ${fixedCount} files.`);
}

removeForceDynamic().catch(console.error);
