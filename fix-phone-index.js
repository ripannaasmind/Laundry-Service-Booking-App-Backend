/**
 * Fix phone index issue
 * Problem: Old phone_1 index is NOT sparse, causing duplicate key error for null phones
 * Solution: Drop old index, fix null phones, mongoose will recreate sparse index on restart
 */
import mongoose from 'mongoose';
import 'dotenv/config';

const MONGO_URL = process.env.MONGODB_URI || 'mongodb+srv://naasmind12:naasmind12@cluster0.bnhloit.mongodb.net/ultrawash';

async function fix() {
  await mongoose.connect(MONGO_URL);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');

  // Step 1: Show current indexes
  const indexes = await usersCollection.indexes();
  console.log('\n📋 Current indexes:');
  indexes.forEach(idx => {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} | unique: ${idx.unique || false} | sparse: ${idx.sparse || false}`);
  });

  // Step 2: Drop the problematic phone_1 index
  const phoneIndex = indexes.find(i => i.name === 'phone_1');
  if (phoneIndex) {
    console.log('\n🗑️  Dropping old phone_1 index...');
    await usersCollection.dropIndex('phone_1');
    console.log('✅ Old phone_1 index dropped');
  } else {
    console.log('\n⚠️  No phone_1 index found');
  }

  // Step 3: Fix all users with phone: null or phone: "" → unset the field
  const nullPhoneResult = await usersCollection.updateMany(
    { $or: [{ phone: null }, { phone: "" }] },
    { $unset: { phone: "" } }
  );
  console.log(`\n🔧 Fixed ${nullPhoneResult.modifiedCount} users with null/empty phone (unset field)`);

  // Step 4: Show users without phone
  const usersWithoutPhone = await usersCollection.find(
    { phone: { $exists: false } }
  ).project({ email: 1, name: 1, googleId: 1 }).toArray();
  console.log(`\n👥 Users without phone field (${usersWithoutPhone.length}):`);
  usersWithoutPhone.forEach(u => console.log(`  - ${u.email} (${u.name})`));

  // Step 5: Create new sparse unique index
  console.log('\n🔨 Creating new sparse unique phone index...');
  await usersCollection.createIndex(
    { phone: 1 },
    { unique: true, sparse: true }
  );
  console.log('✅ New sparse phone_1 index created');

  // Step 6: Verify
  const newIndexes = await usersCollection.indexes();
  console.log('\n📋 Updated indexes:');
  newIndexes.forEach(idx => {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)} | unique: ${idx.unique || false} | sparse: ${idx.sparse || false}`);
  });

  console.log('\n✅ All done! Google login should work now.');
  await mongoose.disconnect();
  process.exit(0);
}

fix().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
