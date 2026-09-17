const admin = require('firebase-admin');

// To run this script:
// 1. You need a firebase admin service account key JSON file.
// 2. Set GOOGLE_APPLICATION_CREDENTIALS path to that file, or initialize it directly.
// Example:
// export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/serviceAccountKey.json"
// node scripts/migrate-tags.js

if (!admin.apps.length) {
  // If GOOGLE_APPLICATION_CREDENTIALS is set, admin.initializeApp() will use it automatically
  admin.initializeApp();
}

const db = admin.firestore();

async function migrate() {
  console.log('Starting migration to backfill tags and featured flags...');
  const postsRef = db.collection('posts');
  const snapshot = await postsRef.get();

  if (snapshot.empty) {
    console.log('No posts found.');
    return;
  }

  let batch = db.batch();
  let count = 0;
  let totalMigrated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    
    // Only update if they are missing
    let updates = {};
    if (data.tags === undefined) {
      updates.tags = [];
    }
    if (data.featured === undefined) {
      updates.featured = false;
    }

    if (Object.keys(updates).length > 0) {
      batch.update(doc.ref, updates);
      count++;
      totalMigrated++;
    }

    // Firestore batches can only have up to 500 operations
    if (count >= 400) {
      console.log(`Committing batch of ${count} updates...`);
      await batch.commit();
      batch = db.batch(); // start a new batch
      count = 0;
    }
  }

  if (count > 0) {
    console.log(`Committing final batch of ${count} updates...`);
    await batch.commit();
  }

  console.log(`Migration complete. Updated ${totalMigrated} posts.`);
}

migrate().catch(console.error);
