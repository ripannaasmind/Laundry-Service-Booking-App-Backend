import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './src/model/user.model.js';
import Store from './src/model/store.model.js';
import Service from './src/model/service.model.js';

const MONGO_URL = process.env.MONGODB_URI;

const seedAll = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    const hashedPassword = await bcrypt.hash('123456', 10);

    // ==================== SERVICES ====================
    console.log('\n📦 Seeding Services...');
    const servicesData = [
      { name: 'Wash & Fold', slug: 'wash-and-fold', description: 'Professional wash and fold service for everyday clothes', shortDescription: 'Everyday laundry made easy', category: 'washing', pricingType: 'per_kg', pricePerKg: 60, estimatedDays: 2, features: ['Sorted by color', 'Cold/warm wash', 'Folded neatly'], isActive: true, sortOrder: 1 },
      { name: 'Wash & Iron', slug: 'wash-and-iron', description: 'Complete wash with professional ironing and pressing', shortDescription: 'Crisp and clean clothes', category: 'washing', pricingType: 'per_kg', pricePerKg: 80, estimatedDays: 2, features: ['Machine wash', 'Steam iron', 'Hung on hangers'], isActive: true, sortOrder: 2 },
      { name: 'Dry Cleaning', slug: 'dry-cleaning', description: 'Premium dry cleaning for delicate and formal wear', shortDescription: 'For delicate fabrics', category: 'dry_cleaning', pricingType: 'per_item', pricePerItem: 250, estimatedDays: 3, features: ['Chemical-free solvents', 'Spot treatment', 'Protective packaging'], isActive: true, sortOrder: 3 },
      { name: 'Ironing Only', slug: 'ironing-only', description: 'Professional ironing and pressing service', shortDescription: 'Wrinkle-free guaranteed', category: 'ironing', pricingType: 'per_item', pricePerItem: 30, estimatedDays: 1, features: ['Steam pressing', 'Collar & cuff attention', 'Crease lines'], isActive: true, sortOrder: 4 },
      { name: 'Premium Laundry', slug: 'premium-laundry', description: 'Premium care for high-end garments with special treatment', shortDescription: 'Luxury fabric care', category: 'premium', pricingType: 'per_item', pricePerItem: 400, estimatedDays: 3, features: ['Hand wash option', 'Premium detergent', 'Individual packaging'], isActive: true, sortOrder: 5 },
      { name: 'Curtain Cleaning', slug: 'curtain-cleaning', description: 'Deep cleaning service for curtains and drapes', shortDescription: 'Freshen up your home', category: 'specialty', pricingType: 'per_item', pricePerItem: 300, estimatedDays: 4, features: ['Dust removal', 'Stain treatment', 'Re-hanging available'], isActive: true, sortOrder: 6 },
      { name: 'Shoe Cleaning', slug: 'shoe-cleaning', description: 'Professional shoe cleaning and restoration', shortDescription: 'Restore your footwear', category: 'specialty', pricingType: 'per_item', pricePerItem: 200, estimatedDays: 2, features: ['Deep clean', 'Deodorizing', 'Polish & shine'], isActive: true, sortOrder: 7 },
      { name: 'Bedding & Linen', slug: 'bedding-and-linen', description: 'Thorough cleaning for bedsheets, blankets, and comforters', shortDescription: 'Fresh bed every night', category: 'washing', pricingType: 'per_item', pricePerItem: 150, estimatedDays: 3, features: ['Sanitized wash', 'Fabric softener', 'Anti-allergen treatment'], isActive: true, sortOrder: 8 },
    ];

    for (const svc of servicesData) {
      const existing = await Service.findOne({ slug: svc.slug });
      if (existing) {
        Object.assign(existing, svc);
        await existing.save();
        console.log(`  Updated service: ${svc.name}`);
      } else {
        await Service.create(svc);
        console.log(`  Created service: ${svc.name}`);
      }
    }

    const allServices = await Service.find({ isActive: true });
    const serviceIds = allServices.map(s => s._id);

    // ==================== STORES (Location-wise for Dhaka) ====================
    console.log('\n🏪 Seeding Location-based Stores...');
    const storesData = [
      {
        name: 'UltraWash Gulshan', slug: 'ultrawash-gulshan',
        description: 'Premium laundry service in the heart of Gulshan',
        address: 'House 45, Road 103, Gulshan 2', area: 'Gulshan', city: 'Dhaka',
        latitude: 23.7925, longitude: 90.4078, phone: '+8801700000001', email: 'gulshan@ultrawash.com',
        features: ['Free Pickup', 'Express Delivery', 'Dry Cleaning', '24/7 Support'],
        isFeatured: true, sortOrder: 1,
      },
      {
        name: 'UltraWash Dhanmondi', slug: 'ultrawash-dhanmondi',
        description: 'Your trusted laundry partner in Dhanmondi',
        address: 'House 12, Road 27, Dhanmondi', area: 'Dhanmondi', city: 'Dhaka',
        latitude: 23.7465, longitude: 90.3762, phone: '+8801700000002', email: 'dhanmondi@ultrawash.com',
        features: ['Free Pickup', 'Same Day Delivery', 'Eco-Friendly'],
        isFeatured: true, sortOrder: 2,
      },
      {
        name: 'UltraWash Banani', slug: 'ultrawash-banani',
        description: 'Quick and quality laundry in Banani area',
        address: 'House 78, Road 11, Banani', area: 'Banani', city: 'Dhaka',
        latitude: 23.7937, longitude: 90.4033, phone: '+8801700000003', email: 'banani@ultrawash.com',
        features: ['Free Pickup', 'Express Delivery', 'Premium Care'],
        isFeatured: false, sortOrder: 3,
      },
      {
        name: 'UltraWash Uttara', slug: 'ultrawash-uttara',
        description: 'Convenient laundry service in Uttara',
        address: 'House 5, Sector 7, Uttara', area: 'Uttara', city: 'Dhaka',
        latitude: 23.8759, longitude: 90.3795, phone: '+8801700000004', email: 'uttara@ultrawash.com',
        features: ['Free Pickup', 'Bulk Discount', 'Student Discount'],
        isFeatured: false, sortOrder: 4,
      },
      {
        name: 'UltraWash Mirpur', slug: 'ultrawash-mirpur',
        description: 'Affordable laundry solutions in Mirpur',
        address: 'Plot 10, Section 10, Mirpur', area: 'Mirpur', city: 'Dhaka',
        latitude: 23.8223, longitude: 90.3654, phone: '+8801700000005', email: 'mirpur@ultrawash.com',
        features: ['Free Pickup', 'Budget Friendly', 'Fast Turnaround'],
        isFeatured: false, sortOrder: 5,
      },
      {
        name: 'UltraWash Mohammadpur', slug: 'ultrawash-mohammadpur',
        description: 'Professional laundry in Mohammadpur',
        address: 'House 22, Tajmahal Road, Mohammadpur', area: 'Mohammadpur', city: 'Dhaka',
        latitude: 23.7662, longitude: 90.3588, phone: '+8801700000006', email: 'mohammadpur@ultrawash.com',
        features: ['Free Pickup', 'Family Package', 'Monthly Plans'],
        isFeatured: false, sortOrder: 6,
      },
    ];

    for (const store of storesData) {
      const existing = await Store.findOne({ slug: store.slug });
      const storePayload = {
        ...store,
        location: { type: 'Point', coordinates: [store.longitude, store.latitude] },
        services: serviceIds,
        isActive: true,
      };
      delete storePayload.latitude;
      delete storePayload.longitude;

      if (existing) {
        Object.assign(existing, storePayload);
        await existing.save();
        console.log(`  Updated store: ${store.name}`);
      } else {
        await Store.create(storePayload);
        console.log(`  Created store: ${store.name}`);
      }
    }

    // ==================== USERS (Delivery & Staff) ====================
    console.log('\n👥 Seeding Users...');

    const deliveryBoys = [
      { name: 'Rahim Delivery', email: 'delivery1@ultrawash.com', phone: '+8801711111101', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.4125, 23.8103] } },
      { name: 'Karim Delivery', email: 'delivery2@ultrawash.com', phone: '+8801711111102', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.4200, 23.8150] } },
      { name: 'Jamal Delivery', email: 'delivery3@ultrawash.com', phone: '+8801711111103', password: hashedPassword, role: 'delivery', isVerified: true, currentLocation: { type: 'Point', coordinates: [90.3950, 23.7900] } },
    ];

    const staffMembers = [
      { name: 'Salam Staff', email: 'staff1@ultrawash.com', phone: '+8801711111201', password: hashedPassword, role: 'staff', isVerified: true },
      { name: 'Hasan Staff', email: 'staff2@ultrawash.com', phone: '+8801711111202', password: hashedPassword, role: 'staff', isVerified: true },
      { name: 'Mina Staff', email: 'staff3@ultrawash.com', phone: '+8801711111203', password: hashedPassword, role: 'staff', isVerified: true },
    ];

    // Admin user
    const adminUser = { name: 'Admin', email: 'admin@ultrawash.com', phone: '+8801700000000', password: hashedPassword, role: 'admin', isVerified: true };

    for (const u of [adminUser, ...deliveryBoys, ...staffMembers]) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        existing.role = u.role;
        existing.password = u.password;
        if (u.currentLocation) existing.currentLocation = u.currentLocation;
        await existing.save();
        console.log(`  Updated: ${u.email} (${u.role})`);
      } else {
        await User.create(u);
        console.log(`  Created: ${u.email} (${u.role})`);
      }
    }

    console.log('\n✅ All data seeded successfully!');
    console.log('\n📋 Login Credentials (all passwords: 123456):');
    console.log('  Admin:     admin@ultrawash.com');
    console.log('  Delivery:  delivery1@ultrawash.com, delivery2@ultrawash.com, delivery3@ultrawash.com');
    console.log('  Staff:     staff1@ultrawash.com, staff2@ultrawash.com, staff3@ultrawash.com');
    console.log('  Customer:  (register via /signup page)');
    console.log('\n🏪 Stores seeded: Gulshan, Dhanmondi, Banani, Uttara, Mirpur, Mohammadpur');
    console.log('📦 Services seeded: Wash & Fold, Wash & Iron, Dry Cleaning, Ironing, Premium, Curtain, Shoe, Bedding');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seedAll();
