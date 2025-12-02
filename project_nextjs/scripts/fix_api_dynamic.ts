
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function fixApiRoutes() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');

        if (content.includes("export const dynamic = 'force-dynamic'")) {
            continue;
        }

        if (content.includes('export const dynamic = "force-dynamic"')) {
            continue;
        }

        // Insert after imports
        const lines = content.split('\n');
        let insertIndex = 0;

        // Try to find the last import line
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('importtype')) {
                insertIndex = i + 1;
            }
        }

        // Insert the line
        lines.splice(insertIndex, 0, "export const dynamic = 'force-dynamic';");

        fs.writeFileSync(file, lines.join('\n'));
        console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
        fixedCount++;
    }

    console.log(`\nDone. Fixed ${fixedCount} files.`);
}

fixApiRoutes().catch(console.error);
