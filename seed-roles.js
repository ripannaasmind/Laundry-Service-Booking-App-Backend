import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/model/user.model.js';

const MONGO_URL = process.env.MONGODB_URI;

const seedRoles = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // Delivery Boys
    const deliveryBoys = [
      { name: 'Rahim Delivery', email: 'delivery1@ultrawash.com', phone: '+8801711111101', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.4125, 23.8103] } },
      { name: 'Karim Delivery', email: 'delivery2@ultrawash.com', phone: '+8801711111102', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.4200, 23.8150] } },
      { name: 'Jamal Delivery', email: 'delivery3@ultrawash.com', phone: '+8801711111103', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.3950, 23.7900] } },
    ];

    // Staff
    const staffMembers = [
      { name: 'Salam Staff', email: 'staff1@ultrawash.com', phone: '+8801711111201', password: hashedPassword, role: 'staff', isVerified: true },
      { name: 'Hasan Staff', email: 'staff2@ultrawash.com', phone: '+8801711111202', password: hashedPassword, role: 'staff', isVerified: true },
      { name: 'Mina Staff', email: 'staff3@ultrawash.com', phone: '+8801711111203', password: hashedPassword, role: 'staff', isVerified: true },
    ];

    for (const db of deliveryBoys) {
      const existing = await User.findOne({ email: db.email });
      if (existing) {
        existing.role = 'delivery';
        existing.currentLocation = db.currentLocation;
        await existing.save();
        console.log(`Updated: ${db.email}`);
      } else {
        await User.create(db);
        console.log(`Created delivery boy: ${db.email}`);
      }
    }

    for (const s of staffMembers) {
      const existing = await User.findOne({ email: s.email });
      if (existing) {
        existing.role = 'staff';
        await existing.save();
        console.log(`Updated: ${s.email}`);
      } else {
        await User.create(s);
        console.log(`Created staff: ${s.email}`);
      }
    }

    console.log('\n✅ All roles seeded successfully!');
    console.log('\nLogin credentials (all passwords: 123456):');
    console.log('Delivery Boys: delivery1@ultrawash.com, delivery2@ultrawash.com, delivery3@ultrawash.com');
    console.log('Staff: staff1@ultrawash.com, staff2@ultrawash.com, staff3@ultrawash.com');
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedRoles();
