
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const appDir = path.join(process.cwd(), 'src', 'app');

async function fixAllRoutes() {
    console.log(`Scanning ${appDir} for route.ts files...`);

    // Find all route.ts files in src/app (recursive)
    const files = await glob('**/route.ts', { cwd: appDir, absolute: true });

    console.log(`Found ${files.length} route.ts files.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // 1. Remove "use server"
        content = content.replace(/['"]use server['"];?\r?\n?/g, '');

        // 2. Add force-dynamic if missing
        if (!content.includes("export const dynamic = 'force-dynamic'")) {
            // Insert after imports
            const importRegex = /import[\s\S]*?from\s+['"][^'"]+['"];?/g;
            const imports = content.match(importRegex);

            if (imports && imports.length > 0) {
                const lastImport = imports[imports.length - 1];
                const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;

                content = content.slice(0, lastImportIndex) + "\nexport const dynamic = 'force-dynamic';" + content.slice(lastImportIndex);
            } else {
                // No imports, add to top
                content = "export const dynamic = 'force-dynamic';\n" + content;
            }
        }

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`Fixed: ${path.relative(process.cwd(), file)}`);
            fixedCount++;
        }
    }

    console.log(`\nDone. Fixed ${fixedCount} files.`);
}

fixAllRoutes().catch(console.error);
