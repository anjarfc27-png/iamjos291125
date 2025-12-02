
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function removeUseServer() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Remove "use server" lines (with or without quotes, semicolons, etc.)
        content = content.replace(/['"]use server['"];?\r?\n?/g, '');

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`Removed "use server" from: ${path.relative(process.cwd(), file)}`);
            fixedCount++;
        }
    }

    console.log(`\nDone. Removed "use server" from ${fixedCount} files.`);
}

removeUseServer().catch(console.error);
