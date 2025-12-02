
import fs from 'fs';
import path from 'path';

const APP_DIR = path.join(process.cwd(), 'src', 'app');

// Define the menu structure we found in the previous audit
const MENUS = {
    admin: [
        '/admin/site-management/hosted-journals',
        '/admin/site-settings/site-setup',
        '/admin/system/system-information',
        '/admin/system/expire-sessions',
        '/admin/system/clear-data-caches',
        '/admin/system/clear-template-cache',
        '/admin/system/clear-scheduled-tasks',
    ],
    manager: [
        '/manager', // Submissions
        '/manager/issues',
        '/manager/settings/context',
        '/manager/settings/website',
        '/manager/settings/workflow',
        '/manager/settings/distribution',
        '/manager/users-roles',
        '/manager/statistics/publications',
        '/manager/statistics/editorial',
        '/manager/statistics/users',
        '/manager/statistics/reports',
        '/manager/tools',
    ],
    editor: [
        '/editor', // Submissions
        '/editor/issues',
        '/editor/announcements',
        '/editor/settings/context',
        '/editor/settings/website',
        '/editor/settings/workflow',
        '/editor/settings/distribution',
        '/editor/settings/access',
        '/editor/users-roles',
        '/editor/tools',
        '/editor/statistics/editorial',
        '/editor/statistics/publications',
        '/editor/statistics/users',
    ],
    author: [
        '/author/dashboard',
        '/author/submission/new',
        '/author/published',
        '/author/statistics',
        '/author/profile',
        '/author/help',
    ],
    reviewer: [
        '/reviewer/dashboard',
        '/reviewer/assignments',
        '/reviewer/completed',
        '/reviewer/history',
        '/reviewer/statistics',
        '/reviewer/profile',
        '/reviewer/help',
    ]
};

function checkRoute(routePath: string) {
    // Convert route to file path
    // e.g. /admin/site-management -> src/app/(admin)/admin/site-management/page.tsx
    // OR src/app/admin/site-management/page.tsx
    // We need to handle the route groups (parentheses)

    const parts = routePath.split('/').filter(Boolean);

    // Possible root directories in src/app
    const routeGroups = ['(admin)', '(manager)', '(editor)', '(author)', '(reviewer)', '(site)', ''];

    let found = false;
    let foundPath = '';

    for (const group of routeGroups) {
        const potentialPath = path.join(APP_DIR, group, ...parts, 'page.tsx');
        if (fs.existsSync(potentialPath)) {
            found = true;
            foundPath = potentialPath;
            break;
        }
        // Also check for dynamic routes if exact match fails? 
        // For this audit, we expect exact matches for menu items usually.
        // But let's check for index page too if it's a root
    }

    return { route: routePath, found, path: foundPath };
}

console.log('🔍 Auditing UI Routes vs File System...\n');

const missing: string[] = [];
const present: string[] = [];

for (const [role, routes] of Object.entries(MENUS)) {
    console.log(`Checking ${role.toUpperCase()} Menu:`);
    for (const route of routes) {
        const result = checkRoute(route);
        if (result.found) {
            console.log(`  ✅ ${route}`);
            present.push(route);
        } else {
            console.log(`  ❌ ${route} (Missing page.tsx)`);
            missing.push(route);
        }
    }
    console.log('');
}

console.log('--- Summary ---');
console.log(`Total Routes Checked: ${present.length + missing.length}`);
console.log(`Present: ${present.length}`);
console.log(`Missing: ${missing.length}`);

if (missing.length > 0) {
    console.log('\nMissing Routes (UI exists, System missing):');
    missing.forEach(r => console.log(`- ${r}`));
}
