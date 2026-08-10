/**
 * Batch Password Reset Script
 * Resets all team member passwords to TestAudit@123 using the live API.
 */

const API = 'https://ai-leados.onrender.com/api';
const NEW_PASSWORD = 'TestAudit@123';

// Your SuperAdmin credentials
const SA_EMAIL = 'yadavarpan03@gmail.com';
const SA_PASSWORD = '@Apy18748';

const TARGET_EMAILS = [
  'arshjot18514@stu.upes.ac.in',
  'saranshupadhyay2007@gmail.com',
  'prernavijay61861@gmail.com',
  'sharmaharshvardhan5555@gmail.com',
  'admin@leados.com',
  'ujjawalagrawal01032007@gmail.com'
];

async function run() {
  console.log('🔐 AI LeadOS — Batch Password Reset Tool');
  console.log('─'.repeat(50));

  // Step 1: Login as SuperAdmin
  console.log('\n1. Logging in as SuperAdmin...');
  const loginRes = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: SA_EMAIL, password: SA_PASSWORD })
  });
  const loginData = await loginRes.json();

  if (!loginData.accessToken) {
    console.error('❌ Login failed:', JSON.stringify(loginData));
    process.exit(1);
  }
  const token = loginData.accessToken;
  console.log('   ✅ Logged in. Token obtained.');

  // Step 2: Fetch all users in the tenant
  console.log('\n2. Fetching all users in tenant...');
  const usersRes = await fetch(`${API}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!usersRes.ok) {
    const err = await usersRes.text();
    console.error(`❌ Failed to fetch users: ${usersRes.status} — ${err}`);
    process.exit(1);
  }

  const allUsers = await usersRes.json();
  const users = Array.isArray(allUsers) ? allUsers : (allUsers.users ?? allUsers.data ?? []);
  console.log(`   ✅ Found ${users.length} users in system.`);

  // Step 3: Filter to target emails only
  const targets = users.filter(u => TARGET_EMAILS.includes(u.email));
  console.log(`   🎯 Matched ${targets.length} of ${TARGET_EMAILS.length} target emails.`);

  if (targets.length === 0) {
    console.log('\n⚠️  No matching users found. Printing all user emails:');
    users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
    process.exit(1);
  }

  // Step 4: Reset password for each user
  console.log(`\n3. Resetting passwords to "${NEW_PASSWORD}"...`);
  console.log('─'.repeat(50));

  let successCount = 0;
  let failCount = 0;

  for (const user of targets) {
    const resetRes = await fetch(`${API}/admin/users/${user.id}/reset-password`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newPassword: NEW_PASSWORD })
    });

    const rawBody = await resetRes.text();
    if (resetRes.ok) {
      console.log(`   ✅ ${user.name} (${user.email})`);
      successCount++;
    } else {
      console.log(`   ❌ ${user.name} (${user.email}) — ${resetRes.status}: ${rawBody}`);
      failCount++;
    }
  }

  // Step 5: Also test that one of the reset passwords actually works
  console.log('\n4. Verifying reset by logging in as first target user...');
  if (targets.length > 0) {
    const verifyRes = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: targets[0].email, password: NEW_PASSWORD })
    });
    if (verifyRes.ok) {
      console.log(`   ✅ Login verified for ${targets[0].email} with new password!`);
    } else {
      const err = await verifyRes.text();
      console.log(`   ❌ Login verification failed for ${targets[0].email}: ${err}`);
    }
  }

  console.log('\n' + '─'.repeat(50));
  console.log(`✅ SUCCESS: ${successCount}  |  ❌ FAILED: ${failCount}`);
  console.log(`\nAll members can now log in with: ${NEW_PASSWORD}`);
  console.log('─'.repeat(50));
}

run().catch(e => { console.error('Fatal error:', e); process.exit(1); });
