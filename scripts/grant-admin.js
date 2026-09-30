const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = path.resolve(__dirname, '../serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('\n❌ ERROR: Service account key not found!');
  console.error('Please generate one from the Firebase Console:');
  console.error('Project Settings > Service Accounts > Generate new private key for udawalawe-wild-blog');
  console.error(`Save it as: ${serviceAccountPath}\n`);
  console.error('⚠️  REMINDER: Do NOT commit this file to git! It is already added to .gitignore.\n');
  process.exit(1);
}

const serviceAccount = require(serviceAccountPath);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function grantAdmin(uid) {
  if (!uid) {
    console.error('\n❌ ERROR: Please provide a UID.');
    console.error('Usage: node scripts/grant-admin.js <UID>\n');
    process.exit(1);
  }

  const adminRef = db.collection('admins').doc(uid);

  try {
    const adminData = {
      grantedAt: admin.firestore.FieldValue.serverTimestamp(),
      grantedVia: 'wild-admin-script',
      note: 'Wild Admin Flutter app service account'
    };

    console.log(`\n⏳ Granting admin access to UID: ${uid}...`);
    await adminRef.set(adminData);
    console.log('✅ Admin access granted successfully!\n');

    console.log('🔍 Verifying document readback...');
    const docSnap = await adminRef.get();
    
    if (docSnap.exists) {
      console.log('✅ Document successfully read back:');
      console.log(JSON.stringify(docSnap.data(), null, 2));
    } else {
      console.error('❌ ERROR: Document not found after write operation.');
    }
  } catch (error) {
    console.error('\n❌ ERROR granting admin access:', error);
  } finally {
    process.exit(0);
  }
}

const targetUid = process.argv[2];
grantAdmin(targetUid);
