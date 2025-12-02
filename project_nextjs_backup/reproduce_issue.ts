
import { getUserRoles, getUserByEmail } from './src/lib/db';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

async function test() {
  console.log('Fetching admin user...');
  // Try admin@ojs.test which seems to be the admin email from previous output
  const user = await getUserByEmail('admin@ojs.test');
  
  if (!user) {
    console.error('Admin user not found!');
    return;
  }

  console.log(`Testing getUserRoles for user: ${user.user_id} (${user.username})`);
  const roles = await getUserRoles(user.user_id);
  console.log('Roles:', JSON.stringify(roles, null, 2));
}

test().catch(console.error);
