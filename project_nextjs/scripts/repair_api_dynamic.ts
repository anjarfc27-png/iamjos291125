
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function repairApiRoutes() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');

        // 1. Remove existing force-dynamic lines (to start fresh)
        const dynamicLineRegex = /export const dynamic = ['"]force-dynamic['"];?\r?\n?/g;
        if (!dynamicLineRegex.test(content)) {
            // If it's not there, we still want to add it, so we don't skip.
            // But if it was never added, we proceed.
        } else {
            content = content.replace(dynamicLineRegex, '');
        }

        // 2. Find the best insertion point
        const lines = content.split('\n');
        let insertIndex = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // Check for end of import statement
            if (line.includes(' from "') || line.includes(" from '") || line.startsWith('import "') || line.startsWith("import '")) {
                insertIndex = i + 1;
            }
        }

        // 3. Insert the line
        lines.splice(insertIndex, 0, "export const dynamic = 'force-dynamic';");

        // 4. Write back
        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Repaired: ${path.relative(process.cwd(), file)}`);
        fixedCount++;
    }

    console.log(`\nDone. Repaired ${fixedCount} files.`);
}

repairApiRoutes().catch(console.error);
