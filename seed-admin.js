import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb+srv://naasmind12:naasmind12@cluster0.bnhloit.mongodb.net/ultrawash');

// Reset admin password
const hash = await bcrypt.hash('admin123', 10);
await mongoose.connection.db.collection('users').updateOne(
  { email: 'admin@ultrawash.com' },
  { $set: { password: hash } }
);
console.log('✅ Admin password updated to: admin123');

await mongoose.disconnect();
process.exit(0);
