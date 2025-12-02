
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const apiDir = path.join(process.cwd(), 'src', 'app', 'api');

async function fixApiTypes() {
    console.log(`Scanning ${apiDir} for route.ts files...`);

    // Find all route.ts files
    const files = await glob('**/route.ts', { cwd: apiDir, absolute: true });

    console.log(`Found ${files.length} API routes.`);

    let fixedCount = 0;

    for (const file of files) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;

        // Replace NextRequest with Request in function signatures
        content = content.replace(/export async function GET\(request: NextRequest/g, 'export async function GET(request: Request');
        content = content.replace(/export async function POST\(request: NextRequest/g, 'export async function POST(request: Request');
        content = content.replace(/export async function PUT\(request: NextRequest/g, 'export async function PUT(request: Request');
        content = content.replace(/export async function DELETE\(request: NextRequest/g, 'export async function DELETE(request: Request');
        content = content.replace(/export async function PATCH\(request: NextRequest/g, 'export async function PATCH(request: Request');

        // Also handle non-async if any
        content = content.replace(/export function GET\(request: NextRequest/g, 'export function GET(request: Request');
        content = content.replace(/export function POST\(request: NextRequest/g, 'export function POST(request: Request');

        if (content !== originalContent) {
            fs.writeFileSync(file, content);
            console.log(`Fixed types in: ${path.relative(process.cwd(), file)}`);
            fixedCount++;
        }
    }

    console.log(`\nDone. Fixed types in ${fixedCount} files.`);
}

fixApiTypes().catch(console.error);
