import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { MONGO_URL } from "./config/config.js";
import User from "./model/user.model.js";
import Service from "./model/service.model.js";
import Coupon from "./model/coupon.model.js";
import Order from "./model/order.model.js";
import Review from "./model/review.model.js";

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("✅ Connected to MongoDB");

    // Clear existing seed data (optional, be careful)
    await Service.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log("🗑️  Cleared old data");

    // ========== 1. CREATE ADMIN USER ==========
    let admin = await User.findOne({ email: "admin@ultrawash.com" });
    if (!admin) {
      const hashedPw = await bcrypt.hash("Admin@123", 10);
      admin = await User.create({
        name: "Admin User",
        email: "admin@ultrawash.com",
        phone: "+8801700000000",
        password: hashedPw,
        isVerified: true,
        role: "admin",
      });
      console.log("👤 Admin created: admin@ultrawash.com / Admin@123");
    } else {
      admin.role = "admin";
      await admin.save();
      console.log("👤 Admin already exists, ensured role=admin");
    }

    // ========== 2. CREATE TEST USER ==========
    let testUser = await User.findOne({ email: "user@ultrawash.com" });
    if (!testUser) {
      const hashedPw = await bcrypt.hash("User@123", 10);
      testUser = await User.create({
        name: "John Doe",
        email: "user@ultrawash.com",
        phone: "+8801711111111",
        password: hashedPw,
        isVerified: true,
        role: "user",
      });
      console.log("👤 Test user created: user@ultrawash.com / User@123");
    } else {
      console.log("�� Test user already exists");
    }

    // ========== 3. SEED SERVICES ==========
    const services = await Service.insertMany([
      {
        name: "Wash & Fold",
        slug: "wash-and-fold",
        description: "Our premium wash and fold service takes the hassle out of doing laundry. We carefully sort your clothes by color and fabric type, wash them using premium detergents, and fold them neatly. Perfect for everyday laundry needs including shirts, pants, undergarments, and casual wear.",
        shortDescription: "Professional washing and folding for your everyday clothes",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=400&fit=crop",
        pricingType: "per_kg",
        pricePerKg: 3.99,
        estimatedDays: 2,
        category: "washing",
        items: [
          { name: "T-Shirt", description: "Cotton T-Shirt wash", price: 2.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Shirt", description: "Formal/casual shirt", price: 3.49, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Pants", description: "Jeans, trousers, chinos", price: 3.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Hoodie", description: "Hoodie & sweatshirt", price: 4.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Jacket", description: "Light jacket wash", price: 5.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Sweater", description: "Knit sweater care", price: 4.49, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Undergarments", description: "Per piece", price: 1.49, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Towel", description: "Bath/hand towel", price: 2.49, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
        ],
        features: ["Color separation", "Premium detergent", "Fabric softener", "Neat folding", "Eco-friendly process"],
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Wash & Iron",
        slug: "wash-and-iron",
        description: "Get your clothes washed and perfectly ironed. This service combines our premium washing with expert pressing. Each garment is inspected, washed at the right temperature, dried appropriately, and then pressed to perfection. Ideal for office wear and formal clothing.",
        shortDescription: "Complete washing and expert ironing service",
        image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&h=400&fit=crop",
        pricingType: "per_kg",
        pricePerKg: 5.99,
        estimatedDays: 3,
        category: "washing",
        items: [
          { name: "Shirt", description: "Washed & ironed", price: 4.49, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Pants", description: "Washed & pressed", price: 4.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Dress", description: "Full dress care", price: 6.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Suit (2pc)", description: "Suit wash & iron", price: 12.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Blazer", description: "Blazer wash & press", price: 8.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Skirt", description: "Skirt wash & iron", price: 4.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Professional wash", "Expert ironing", "Starch on request", "Hanger or folded", "Wrinkle-free guarantee"],
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Dry Cleaning",
        slug: "dry-cleaning",
        description: "Our professional dry cleaning service uses state-of-the-art solvents and techniques to clean your delicate and special garments. Perfect for suits, blazers, silk dresses, cashmere sweaters, and other items that cannot be machine washed. Each item receives individual attention.",
        shortDescription: "Expert dry cleaning for delicate and formal garments",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 8.99,
        estimatedDays: 4,
        category: "dry_cleaning",
        items: [
          { name: "Suit (2pc)", description: "Professional dry clean", price: 15.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Dress", description: "Delicate dry clean", price: 12.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Coat", description: "Winter coat care", price: 18.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Blazer", description: "Blazer dry clean", price: 10.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Silk Garment", description: "Silk special care", price: 14.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Cashmere", description: "Cashmere cleaning", price: 16.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Eco-friendly solvents", "Stain pre-treatment", "Hand finishing", "Protective packaging", "Delicate fabric care"],
        isActive: true,
        sortOrder: 3,
      },
      {
        name: "Ironing Only",
        slug: "ironing-only",
        description: "Professional ironing and pressing service for your already clean clothes. Our experts use professional-grade equipment to ensure crisp, wrinkle-free results. Perfect for shirts, trousers, skirts, and dresses that just need pressing.",
        shortDescription: "Professional pressing for wrinkle-free clothes",
        image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 2.49,
        estimatedDays: 1,
        category: "ironing",
        items: [
          { name: "Shirt", description: "Crisp pressing", price: 1.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Pants", description: "Crease pressing", price: 2.49, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Dress", description: "Full dress iron", price: 3.49, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Suit (2pc)", description: "Suit pressing", price: 5.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Saree", description: "Saree pressing", price: 3.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
        ],
        features: ["Professional equipment", "Temperature control", "Crisp finish", "Same-day available", "Starch options"],
        isActive: true,
        sortOrder: 4,
      },
      {
        name: "Premium Wash",
        slug: "premium-wash",
        description: "Our premium wash service is designed for those who want the very best care for their garments. Includes hand washing for delicates, specialized stain removal, premium organic detergents, and individual garment inspection. Your clothes will look and feel brand new.",
        shortDescription: "Luxury care for your finest garments",
        image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop",
        pricingType: "per_kg",
        pricePerKg: 9.99,
        estimatedDays: 3,
        category: "premium",
        items: [
          { name: "Silk Blouse", description: "Hand wash silk", price: 9.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Cashmere Sweater", description: "Premium knit care", price: 12.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Designer Dress", description: "Luxury garment", price: 14.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Wool Coat", description: "Premium coat care", price: 16.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Leather Jacket", description: "Leather conditioning", price: 19.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
        ],
        features: ["Organic detergents", "Hand wash delicates", "Stain removal", "Fabric conditioning", "Individual inspection", "Premium packaging"],
        isActive: true,
        sortOrder: 5,
      },
      {
        name: "Bedding & Linen",
        slug: "bedding-and-linen",
        description: "Specialized cleaning for all your bedding and household linens. Including bed sheets, pillowcases, duvet covers, blankets, towels, and tablecloths. We use high-temperature washing to eliminate dust mites and allergens, leaving your linens fresh and hygienic.",
        shortDescription: "Deep cleaning for bedsheets, towels, and household linens",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 12.99,
        estimatedDays: 3,
        category: "specialty",
        items: [
          { name: "Bed Sheet (Single)", description: "Single bed sheet", price: 8.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Bed Sheet (Double)", description: "Double bed sheet", price: 11.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Duvet Cover", description: "Duvet cleaning", price: 14.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Pillow Case (pair)", description: "Set of 2", price: 5.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Blanket", description: "Blanket wash", price: 12.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Tablecloth", description: "Table linen care", price: 7.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["High-temp sanitization", "Allergen removal", "Softener treatment", "Crisp pressing", "Hygienic packaging"],
        isActive: true,
        sortOrder: 6,
      },
      {
        name: "Stain Removal",
        slug: "stain-removal",
        description: "Stubborn stain? Our expert stain removal service tackles the toughest marks including wine, oil, ink, blood, and food stains. We use specialized solvents and techniques tailored to each stain type and fabric. Most stains are successfully removed without damaging the garment.",
        shortDescription: "Expert removal of tough and stubborn stains",
        image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 6.99,
        estimatedDays: 3,
        category: "specialty",
        items: [
          { name: "Wine Stain", description: "Red/white wine stain", price: 6.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Oil/Grease Stain", description: "Food oil, grease", price: 7.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Ink Stain", description: "Pen, marker ink", price: 8.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Blood Stain", description: "Blood removal", price: 7.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Coffee/Tea Stain", description: "Beverage stain", price: 5.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Rust Stain", description: "Rust mark removal", price: 9.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Expert analysis", "Fabric-safe solvents", "Multiple treatments", "Before/after inspection", "Satisfaction guarantee"],
        isActive: true,
        sortOrder: 7,
      },
      {
        name: "Shoe Cleaning",
        slug: "shoe-cleaning",
        description: "Professional shoe cleaning and restoration service. We clean all types of shoes including sneakers, leather shoes, suede boots, and canvas footwear. Our process includes deep cleaning, deodorizing, and conditioning to bring your shoes back to life.",
        shortDescription: "Professional cleaning and restoration for all shoe types",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 14.99,
        estimatedDays: 5,
        category: "specialty",
        items: [
          { name: "Sneakers", description: "Sneaker deep clean", price: 12.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Leather Shoes", description: "Leather polish & clean", price: 14.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Suede Boots", description: "Suede restoration", price: 16.99, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Canvas Shoes", description: "Canvas wash", price: 9.99, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Sports Shoes", description: "Athletic shoe care", price: 11.99, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Sandals", description: "Sandal cleaning", price: 7.99, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Deep cleaning", "Deodorizing", "Sole cleaning", "Leather conditioning", "Suede restoration"],
        isActive: true,
        sortOrder: 8,
      },
    ]);
    console.log(`🧺 ${services.length} services created`);

    // ========== 4. SEED COUPONS ==========
    const coupons = await Coupon.insertMany([
      {
        code: "WELCOME20",
        title: "Welcome Offer",
        description: "Get 20% off on your first order! Valid for new customers.",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 15,
        maxDiscount: 50,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        usedCount: 12,
        isActive: true,
      },
      {
        code: "FLAT10",
        title: "Flat $10 Off",
        description: "Save flat $10 on orders above $30. Limited time offer!",
        discountType: "fixed",
        discountValue: 10,
        minOrderValue: 30,
        maxDiscount: 10,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        usedCount: 45,
        isActive: true,
      },
      {
        code: "PREMIUM30",
        title: "Premium Service 30% Off",
        description: "Get 30% off on premium wash services. Treat your clothes to the best!",
        discountType: "percentage",
        discountValue: 30,
        minOrderValue: 25,
        maxDiscount: 75,
        expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usedCount: 8,
        isActive: true,
      },
      {
        code: "SAVE15",
        title: "Save 15% Today",
        description: "15% discount on all services. Order now and save!",
        discountType: "percentage",
        discountValue: 15,
        minOrderValue: 20,
        maxDiscount: 40,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        usedCount: 67,
        isActive: true,
      },
      {
        code: "FLAT5",
        title: "Quick $5 Off",
        description: "Flat $5 off on any order. No minimum required!",
        discountType: "fixed",
        discountValue: 5,
        minOrderValue: 10,
        maxDiscount: 5,
        expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        usageLimit: 1000,
        usedCount: 234,
        isActive: true,
      },
      {
        code: "EXPIRED50",
        title: "Mega Sale 50% Off",
        description: "This coupon has expired.",
        discountType: "percentage",
        discountValue: 50,
        minOrderValue: 10,
        maxDiscount: 100,
        expiryDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        usedCount: 50,
        isActive: false,
      },
    ]);
    console.log(`🎫 ${coupons.length} coupons created`);

    // ========== 5. SEED ORDERS ==========
    const svc = services;
    const now = new Date();
    const daysAgo = (d) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt; };
    const fmtDate = (d) => d.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

    const ordersData = [
      {
        user: testUser._id,
        items: [
          { service: svc[0]._id, serviceName: "Wash & Fold", quantity: 3, price: 3.99, subtotal: 11.97 },
          { service: svc[3]._id, serviceName: "Ironing Only", quantity: 5, price: 2.49, subtotal: 12.45 },
        ],
        itemCount: 8, itemsSummary: "3 Wash & Fold, 5 Ironing Only",
        orderDate: daysAgo(2), deliveryDate: daysAgo(-3),
        status: "in_process", subtotal: 24.42, discount: 0, totalPayment: 24.42,
        paymentMethod: "card", paymentStatus: "paid",
        address: "123 Main Street, Apt 4B, Dhaka 1205",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(2)), status: "completed" },
          { title: "Picked Up", date: fmtDate(daysAgo(1)), status: "completed" },
          { title: "In Process", date: fmtDate(now), status: "current" },
          { title: "Shipped", status: "pending" },
          { title: "Delivered", status: "pending" },
        ],
      },
      {
        user: testUser._id,
        items: [
          { service: svc[2]._id, serviceName: "Dry Cleaning", quantity: 2, price: 8.99, subtotal: 17.98 },
        ],
        itemCount: 2, itemsSummary: "2 Dry Cleaning",
        orderDate: daysAgo(10), deliveryDate: daysAgo(5),
        status: "delivered", subtotal: 17.98, discount: 3.60, totalPayment: 14.38,
        couponCode: "WELCOME20", paymentMethod: "card", paymentStatus: "paid",
        address: "456 Park Avenue, Dhaka 1210",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(10)), status: "completed" },
          { title: "Picked Up", date: fmtDate(daysAgo(9)), status: "completed" },
          { title: "In Process", date: fmtDate(daysAgo(7)), status: "completed" },
          { title: "Shipped", date: fmtDate(daysAgo(6)), status: "completed" },
          { title: "Delivered", date: fmtDate(daysAgo(5)), status: "completed" },
        ],
      },
      {
        user: testUser._id,
        items: [
          { service: svc[4]._id, serviceName: "Premium Wash", quantity: 2, price: 9.99, subtotal: 19.98 },
          { service: svc[1]._id, serviceName: "Wash & Iron", quantity: 3, price: 5.99, subtotal: 17.97 },
        ],
        itemCount: 5, itemsSummary: "2 Premium Wash, 3 Wash & Iron",
        orderDate: daysAgo(20), deliveryDate: daysAgo(15),
        status: "delivered", subtotal: 37.95, discount: 10, totalPayment: 27.95,
        couponCode: "FLAT10", paymentMethod: "card", paymentStatus: "paid",
        address: "789 Lake Road, Chittagong 4000",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(20)), status: "completed" },
          { title: "Picked Up", date: fmtDate(daysAgo(19)), status: "completed" },
          { title: "In Process", date: fmtDate(daysAgo(17)), status: "completed" },
          { title: "Shipped", date: fmtDate(daysAgo(16)), status: "completed" },
          { title: "Delivered", date: fmtDate(daysAgo(15)), status: "completed" },
        ],
      },
      {
        user: testUser._id,
        items: [
          { service: svc[5]._id, serviceName: "Bedding & Linen", quantity: 2, price: 12.99, subtotal: 25.98 },
        ],
        itemCount: 2, itemsSummary: "2 Bedding & Linen",
        orderDate: daysAgo(1), deliveryDate: daysAgo(-4),
        status: "confirmed", subtotal: 25.98, discount: 0, totalPayment: 25.98,
        paymentMethod: "cash", paymentStatus: "pending",
        address: "321 River Street, Sylhet 3100",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(1)), status: "completed" },
          { title: "Picked Up", status: "pending" },
          { title: "In Process", status: "pending" },
          { title: "Shipped", status: "pending" },
          { title: "Delivered", status: "pending" },
        ],
      },
      {
        user: testUser._id,
        items: [
          { service: svc[6]._id, serviceName: "Stain Removal", quantity: 1, price: 6.99, subtotal: 6.99 },
          { service: svc[0]._id, serviceName: "Wash & Fold", quantity: 2, price: 3.99, subtotal: 7.98 },
        ],
        itemCount: 3, itemsSummary: "1 Stain Removal, 2 Wash & Fold",
        orderDate: daysAgo(30), deliveryDate: daysAgo(25),
        status: "delivered", subtotal: 14.97, discount: 0, totalPayment: 14.97,
        paymentMethod: "card", paymentStatus: "paid",
        address: "555 Hill Top, Rajshahi 6200",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(30)), status: "completed" },
          { title: "Picked Up", date: fmtDate(daysAgo(29)), status: "completed" },
          { title: "In Process", date: fmtDate(daysAgo(27)), status: "completed" },
          { title: "Shipped", date: fmtDate(daysAgo(26)), status: "completed" },
          { title: "Delivered", date: fmtDate(daysAgo(25)), status: "completed" },
        ],
      },
      {
        user: testUser._id,
        items: [
          { service: svc[7]._id, serviceName: "Shoe Cleaning", quantity: 2, price: 14.99, subtotal: 29.98 },
        ],
        itemCount: 2, itemsSummary: "2 Shoe Cleaning",
        orderDate: daysAgo(5), deliveryDate: daysAgo(-2),
        status: "cancelled", subtotal: 29.98, discount: 0, totalPayment: 29.98,
        paymentMethod: "card", paymentStatus: "refunded",
        address: "99 Beach Road, Cox's Bazar 4700",
        trackingSteps: [
          { title: "Order Confirmed", date: fmtDate(daysAgo(5)), status: "completed" },
          { title: "Picked Up", status: "cancelled", date: "-" },
          { title: "In Process", status: "cancelled", date: "-" },
          { title: "Shipped", status: "cancelled", date: "-" },
          { title: "Delivered", status: "cancelled", date: "-" },
        ],
      },
    ];

    const orders = [];
    for (const data of ordersData) {
      const order = new Order(data);
      await order.save();
      orders.push(order);
    }
    console.log(`📦 ${orders.length} orders created`);

    // ========== 6. SEED REVIEWS ==========
    // Only for delivered orders
    const deliveredOrders = orders.filter(o => o.status === "delivered");
    const reviewsData = [
      {
        user: testUser._id, order: deliveredOrders[0]._id, orderId: deliveredOrders[0].orderId,
        service: "Dry Cleaning", rating: 5,
        comment: "Excellent dry cleaning service! My suit looks brand new. The stains were completely removed and the pressing was perfect. Highly recommended!",
        status: "approved",
        adminReply: "Thank you for your wonderful feedback! We're glad you loved our dry cleaning service.",
      },
      {
        user: testUser._id, order: deliveredOrders[1]._id, orderId: deliveredOrders[1].orderId,
        service: "Premium Wash, Wash & Iron", rating: 4,
        comment: "Great quality wash and iron service. Clothes came back fresh and neatly pressed. Only minor issue was a slight delay in delivery, but overall very satisfied.",
        status: "approved",
        adminReply: "Thanks for your review! We apologize for the delay and will work on improving our delivery times.",
      },
      {
        user: testUser._id, order: deliveredOrders[2]._id, orderId: deliveredOrders[2].orderId,
        service: "Stain Removal, Wash & Fold", rating: 5,
        comment: "The stain removal team worked magic on my clothes! A wine stain that I thought was permanent is completely gone. Amazing work!",
        status: "approved",
      },
    ];

    const reviews = await Review.insertMany(reviewsData);
    console.log(`⭐ ${reviews.length} reviews created`);

    console.log("\n========================================");
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("========================================");
    console.log("\n📋 Summary:");
    console.log(`   👤 Admin: admin@ultrawash.com / Admin@123`);
    console.log(`   👤 Test User: user@ultrawash.com / User@123`);
    console.log(`   🧺 Services: ${services.length}`);
    console.log(`   🎫 Coupons: ${coupons.length} (1 expired)`);
    console.log(`   📦 Orders: ${orders.length} (3 delivered, 1 in-process, 1 confirmed, 1 cancelled)`);
    console.log(`   ⭐ Reviews: ${reviews.length} (all approved)`);
    console.log("========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err);
    process.exit(1);
  }
};

seed();
