
import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.join(process.cwd());
const SRC_DIR = path.join(ROOT_DIR, 'src');
const SCRIPTS_DIR = path.join(ROOT_DIR, 'scripts');

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build'];

type IssueType = 'EMPTY' | 'TRUNCATED' | 'CONFLICT_MARKERS' | 'SUSPICIOUS_END';

interface FileIssue {
    path: string;
    issues: IssueType[];
    details?: string;
}

function scanDirectory(dir: string): FileIssue[] {
    let results: FileIssue[] = [];

    if (!fs.existsSync(dir)) return results;

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(item)) {
                results = results.concat(scanDirectory(fullPath));
            }
        } else if (stat.isFile()) {
            if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
                const issues = checkFile(fullPath);
                if (issues.length > 0) {
                    results.push({ path: fullPath, issues });
                }
            }
        }
    }

    return results;
}

function checkFile(filePath: string): IssueType[] {
    const issues: IssueType[] = [];
    const content = fs.readFileSync(filePath, 'utf-8');

    // 1. Check for Empty Files
    if (content.trim().length === 0) {
        issues.push('EMPTY');
        return issues; // No need to check others if empty
    }

    // 2. Check for Conflict Markers
    if (content.includes('<<<<<<< HEAD') || content.includes('>>>>>>>')) {
        issues.push('CONFLICT_MARKERS');
    }

    // 3. Check for Truncation / Suspicious End
    // A valid TS/TSX file usually ends with } or ; or ) or > or simple newline
    // It definitely shouldn't end with "export async function" or "const x ="
    const trimmed = content.trim();
    const lastChar = trimmed.slice(-1);
    const lastLine = trimmed.split('\n').pop()?.trim() || '';

    // Heuristic: If it ends with an operator or keyword, it's likely truncated
    if (['=', '+', '-', '*', '/', '(', '{', '[', ',', ':'].includes(lastChar)) {
        issues.push('TRUNCATED');
    } else if (lastLine.startsWith('export ') || lastLine.startsWith('import ')) {
        // If the last line is just an export statement start, it's suspicious
        if (!lastLine.endsWith('}') && !lastLine.endsWith(';') && !lastLine.endsWith("')") && !lastLine.endsWith('")')) {
            issues.push('SUSPICIOUS_END');
        }
    }

    // Heuristic: Count braces. If { count > } count by a lot, it might be truncated.
    // This is naive but helpful for big truncations.
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    if (openBraces > closeBraces) {
        // Only flag if difference is significant or file is small, to avoid false positives in complex template literals
        // But for "CTO audit", let's be strict.
        issues.push('TRUNCATED');
    }

    return issues;
}

console.log('🔍 Starting CTO-Level Codebase Integrity Audit...');
console.log(`Scanning ${SRC_DIR} and ${SCRIPTS_DIR}...\n`);

const srcIssues = scanDirectory(SRC_DIR);
const scriptsIssues = scanDirectory(SCRIPTS_DIR);
const allIssues = [...srcIssues, ...scriptsIssues];

if (allIssues.length === 0) {
    console.log('✅ No obvious integrity issues found.');
} else {
    console.log(`⚠️ Found ${allIssues.length} suspicious files:\n`);
    for (const issue of allIssues) {
        console.log(`📄 ${path.relative(ROOT_DIR, issue.path)}`);
        console.log(`   Issues: ${issue.issues.join(', ')}`);
        console.log('');
    }
}
