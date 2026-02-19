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

    await Service.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    console.log("🗑️  Cleared old data");

    // ========== 1. ADMIN USER ==========
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

    // ========== 2. TEST USER ==========
    let testUser = await User.findOne({ email: "user@ultrawash.com" });
    if (!testUser) {
      const hashedPw = await bcrypt.hash("User@123", 10);
      testUser = await User.create({
        name: "Rafiq Ahmed",
        email: "user@ultrawash.com",
        phone: "+8801711111111",
        password: hashedPw,
        isVerified: true,
        role: "user",
      });
      console.log("👤 Test user created: user@ultrawash.com / User@123");
    } else {
      console.log("👤 Test user already exists");
    }

    // ========== 3. SEED SERVICES (All prices in USD — converted to target currency on frontend) ==========
    const services = await Service.insertMany([
      {
        name: "Wash & Fold",
        slug: "wash-and-fold",
        description: "Our Wash & Fold service takes care of your everyday laundry. Clothes are carefully sorted by color and fabric type, washed with premium detergent, tumble dried, and neatly folded. Ideal for shirts, pants, t-shirts, undergarments, towels, and all daily wear items.",
        shortDescription: "Professional washing and folding for everyday clothes",
        image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 3.00,
        estimatedDays: 2,
        category: "washing",
        items: [
          { name: "T-Shirt", description: "Cotton t-shirt wash & fold", price: 3.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Shirt", description: "Formal or casual shirt", price: 4.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Pant / Trouser", description: "Jeans, trousers, chinos", price: 5.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Hoodie / Sweatshirt", description: "Hoodie & sweatshirt wash", price: 7.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Jacket", description: "Light jacket wash", price: 10.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Sweater", description: "Sweater care wash", price: 6.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Undergarments (pc)", description: "Per piece", price: 1.50, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Towel", description: "Bath or hand towel", price: 3.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Lungi", description: "Lungi wash", price: 2.50, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Pajama", description: "Pajama wash", price: 3.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
        ],
        features: ["Color separation", "Premium detergent", "Fabric softener", "Neat folding", "Eco-friendly process"],
        isActive: true,
        sortOrder: 1,
      },
      {
        name: "Wash & Iron",
        slug: "wash-and-iron",
        description: "Get your clothes washed and perfectly ironed. This service combines premium washing with expert pressing. Each garment is inspected, washed at the right temperature, dried properly, and then steam-pressed to perfection. Ideal for office wear and formal clothing.",
        shortDescription: "Complete washing and expert ironing service",
        image: "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 5.00,
        estimatedDays: 2,
        category: "washing",
        items: [
          { name: "Shirt", description: "Washed & ironed", price: 5.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Pant / Trouser", description: "Washed & pressed", price: 6.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Panjabi", description: "Panjabi wash & iron", price: 8.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Saree", description: "Saree wash & press", price: 12.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Suit (2pc)", description: "Suit wash & iron", price: 20.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Blazer", description: "Blazer wash & press", price: 15.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Salwar Kameez", description: "Salwar kameez wash & iron", price: 10.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
        ],
        features: ["Professional wash", "Expert ironing", "Starch on request", "Hanger or folded", "Wrinkle-free guarantee"],
        isActive: true,
        sortOrder: 2,
      },
      {
        name: "Dry Cleaning",
        slug: "dry-cleaning",
        description: "Professional dry cleaning using state-of-the-art solvents and techniques for your delicate and high-value garments. Perfect for suits, blazers, silk sarees, lehengas, sherwanis, wedding dresses, and other items that cannot be machine washed. Each item gets individual attention and care.",
        shortDescription: "Expert dry cleaning for delicate and formal garments",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 20.00,
        estimatedDays: 3,
        category: "dry_cleaning",
        items: [
          { name: "Suit (2pc)", description: "Professional dry clean", price: 25.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Suit (3pc)", description: "Three-piece suit cleaning", price: 35.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Blazer", description: "Blazer dry clean", price: 18.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Overcoat / Long Coat", description: "Overcoat care", price: 30.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Silk Saree", description: "Silk saree special care", price: 22.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Lehenga", description: "Lehenga cleaning", price: 45.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Sherwani", description: "Sherwani dry clean", price: 35.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Wedding Dress", description: "Wedding dress special care", price: 120.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
        ],
        features: ["Eco-friendly solvents", "Stain pre-treatment", "Hand finishing", "Protective packaging", "Delicate fabric care"],
        isActive: true,
        sortOrder: 3,
      },
      {
        name: "Ironing / Pressing",
        slug: "ironing-only",
        description: "Professional ironing and pressing service for your already clean clothes. Our experts use professional-grade steam equipment to ensure crisp, wrinkle-free results. Perfect for shirts, trousers, sarees, panjabis, and formal wear that just needs pressing.",
        shortDescription: "Professional pressing for wrinkle-free clothes",
        image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 2.00,
        estimatedDays: 1,
        category: "ironing",
        items: [
          { name: "Shirt", description: "Crisp shirt pressing", price: 2.50, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Pant / Trouser", description: "Trouser crease pressing", price: 3.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "T-Shirt", description: "T-shirt press", price: 2.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Saree", description: "Saree pressing", price: 5.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Panjabi", description: "Panjabi pressing", price: 3.50, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Suit (2pc)", description: "Suit pressing", price: 8.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Salwar Kameez", description: "Salwar kameez pressing", price: 4.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
        ],
        features: ["Professional equipment", "Temperature control", "Crisp finish", "Same-day available", "Starch options"],
        isActive: true,
        sortOrder: 4,
      },
      {
        name: "Premium / Delicate Wash",
        slug: "premium-wash",
        description: "Our premium wash service is designed for those who want the very best care for their high-value garments. Includes hand washing for delicates, specialized stain removal, premium organic detergents, and individual garment inspection. Your clothes will look and feel brand new.",
        shortDescription: "Luxury care for your finest garments",
        image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 15.00,
        estimatedDays: 3,
        category: "premium",
        items: [
          { name: "Silk Blouse / Top", description: "Hand wash silk", price: 15.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Cashmere Sweater", description: "Premium knit care", price: 20.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Designer Dress", description: "Designer garment care", price: 25.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Wool Coat", description: "Premium coat care", price: 30.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Leather Jacket", description: "Leather conditioning", price: 35.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Jamdani Saree", description: "Jamdani saree special care", price: 28.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Organic detergents", "Hand wash delicates", "Stain removal", "Fabric conditioning", "Individual inspection", "Premium packaging"],
        isActive: true,
        sortOrder: 5,
      },
      {
        name: "Bedding & Linen",
        slug: "bedding-and-linen",
        description: "Specialized cleaning for all your bedding and household linens. Bed sheets, pillow cases, comforters, blankets, curtains, and tablecloths — all washed at high temperature to eliminate dust mites and allergens, leaving your linens fresh, hygienic, and crisp.",
        shortDescription: "Deep cleaning for bedsheets, blankets, and household linens",
        image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 8.00,
        estimatedDays: 3,
        category: "specialty",
        items: [
          { name: "Bed Sheet (Single)", description: "Single bed sheet wash", price: 8.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Bed Sheet (Double)", description: "Double bed sheet wash", price: 12.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Comforter / Duvet", description: "Comforter deep cleaning", price: 25.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Pillow Case (pair)", description: "Set of 2", price: 5.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Blanket (Light)", description: "Light blanket wash", price: 15.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Blanket (Heavy)", description: "Heavy blanket wash", price: 22.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Curtain (per panel)", description: "Curtain wash per panel", price: 15.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Tablecloth", description: "Table linen care", price: 8.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
        ],
        features: ["High-temp sanitization", "Allergen removal", "Softener treatment", "Crisp pressing", "Hygienic packaging"],
        isActive: true,
        sortOrder: 6,
      },
      {
        name: "Stain Removal",
        slug: "stain-removal",
        description: "Stubborn stain? Our expert stain removal service tackles the toughest marks including oil, ink, turmeric, curry, blood, tea, coffee, rust, and paint stains. We use specialized solvents and techniques tailored to each stain type and fabric for safe, effective results.",
        shortDescription: "Expert removal of tough and stubborn stains",
        image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 10.00,
        estimatedDays: 3,
        category: "specialty",
        items: [
          { name: "Oil / Grease Stain", description: "Oil and grease removal", price: 10.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Ink Stain", description: "Pen and marker ink", price: 12.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Turmeric / Curry Stain", description: "Turmeric and curry stain", price: 10.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Blood Stain", description: "Blood stain removal", price: 10.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Tea / Coffee Stain", description: "Beverage stain removal", price: 8.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Rust Stain", description: "Rust mark removal", price: 15.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Paint Stain", description: "Paint stain removal", price: 15.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
        ],
        features: ["Expert analysis", "Fabric-safe solvents", "Multiple treatments", "Before/after inspection", "Satisfaction guarantee"],
        isActive: true,
        sortOrder: 7,
      },
      {
        name: "Shoe Cleaning",
        slug: "shoe-cleaning",
        description: "Professional shoe cleaning and restoration service. We clean all types of shoes including sneakers, leather shoes, suede boots, canvas footwear, and sandals. Our process includes deep cleaning, deodorizing, sole cleaning, and conditioning to bring your shoes back to life.",
        shortDescription: "Professional cleaning and restoration for all shoe types",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=400&fit=crop",
        pricingType: "per_item",
        pricePerItem: 15.00,
        estimatedDays: 4,
        category: "specialty",
        items: [
          { name: "Sneakers / Sports Shoes", description: "Sneaker deep clean", price: 15.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Leather Shoes", description: "Leather polish & clean", price: 20.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
          { name: "Suede / Nubuck", description: "Suede restoration", price: 25.00, image: "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=300&h=300&fit=crop" },
          { name: "Canvas Shoes", description: "Canvas shoe wash", price: 12.00, image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=300&h=300&fit=crop" },
          { name: "Sandals / Kolhapuri", description: "Sandal cleaning", price: 10.00, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=300&fit=crop" },
          { name: "Boots", description: "Boot cleaning & care", price: 28.00, image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop" },
        ],
        features: ["Deep cleaning", "Deodorizing", "Sole cleaning", "Leather conditioning", "Suede restoration"],
        isActive: true,
        sortOrder: 8,
      },
    ]);
    console.log(`🧺 ${services.length} services created`);

    // ========== 4. SEED COUPONS (USD) ==========
    const coupons = await Coupon.insertMany([
      {
        code: "WELCOME20",
        title: "New Customer Offer",
        description: "Get 20% off on your first order! Valid for new customers only.",
        discountType: "percentage",
        discountValue: 20,
        minOrderValue: 25.00,
        maxDiscount: 20.00,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        usedCount: 12,
        isActive: true,
      },
      {
        code: "FLAT10",
        title: "Flat $10 Off",
        description: "Save $10 on orders above $40. Limited time offer!",
        discountType: "fixed",
        discountValue: 10.00,
        minOrderValue: 40.00,
        maxDiscount: 10.00,
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
        minOrderValue: 30.00,
        maxDiscount: 50.00,
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
        minOrderValue: 20.00,
        maxDiscount: 25.00,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 300,
        usedCount: 67,
        isActive: true,
      },
      {
        code: "FLAT5",
        title: "Quick $5 Off",
        description: "Flat $5 off on any order above $15!",
        discountType: "fixed",
        discountValue: 5.00,
        minOrderValue: 15.00,
        maxDiscount: 5.00,
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
        minOrderValue: 15.00,
        maxDiscount: 75.00,
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
          { service: svc[0]._id, serviceName: "Wash & Fold", quantity: 5, price: 0.33, subtotal: 1.67 },
          { service: svc[3]._id, serviceName: "Ironing / Pressing", quantity: 8, price: 0.17, subtotal: 1.33 },
        ],
        itemCount: 13, itemsSummary: "5 Wash & Fold, 8 Ironing",
        orderDate: daysAgo(2), deliveryDate: daysAgo(-3),
        status: "in_process", subtotal: 40.00, discount: 0, totalPayment: 40.00,
        paymentMethod: "card", paymentStatus: "paid",
        address: "House #25, Road #11, Gulshan 2, Dhaka-1212",
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
          { service: svc[2]._id, serviceName: "Dry Cleaning", quantity: 2, price: 25.00, subtotal: 50.00 },
        ],
        itemCount: 2, itemsSummary: "2 Dry Cleaning (Suit)",
        orderDate: daysAgo(10), deliveryDate: daysAgo(5),
        status: "delivered", subtotal: 50.00, discount: 10.00, totalPayment: 40.00,
        couponCode: "WELCOME20", paymentMethod: "card", paymentStatus: "paid",
        address: "House #45, Road #27, Banani, Dhaka-1213",
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
          { service: svc[4]._id, serviceName: "Premium / Delicate Wash", quantity: 2, price: 1.67, subtotal: 3.33 },
          { service: svc[1]._id, serviceName: "Wash & Iron", quantity: 5, price: 0.42, subtotal: 2.08 },
        ],
        itemCount: 7, itemsSummary: "2 Premium Wash, 5 Wash & Iron",
        orderDate: daysAgo(20), deliveryDate: daysAgo(15),
        status: "delivered", subtotal: 65.00, discount: 10.00, totalPayment: 55.00,
        couponCode: "FLAT100", paymentMethod: "card", paymentStatus: "paid",
        address: "House #12, Road #8, Dhanmondi, Dhaka-1205",
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
          { service: svc[5]._id, serviceName: "Bedding & Linen", quantity: 3, price: 12.00, subtotal: 36.00 },
        ],
        itemCount: 3, itemsSummary: "3 Bedding & Linen",
        orderDate: daysAgo(1), deliveryDate: daysAgo(-4),
        status: "confirmed", subtotal: 36.00, discount: 0, totalPayment: 36.00,
        paymentMethod: "cash", paymentStatus: "pending",
        address: "Plot #8, Sector 7, Uttara, Dhaka-1230",
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
          { service: svc[6]._id, serviceName: "Stain Removal", quantity: 2, price: 0.83, subtotal: 1.67 },
          { service: svc[0]._id, serviceName: "Wash & Fold", quantity: 4, price: 0.33, subtotal: 1.33 },
        ],
        itemCount: 6, itemsSummary: "2 Stain Removal, 4 Wash & Fold",
        orderDate: daysAgo(30), deliveryDate: daysAgo(25),
        status: "delivered", subtotal: 36.00, discount: 0, totalPayment: 36.00,
        paymentMethod: "card", paymentStatus: "paid",
        address: "House #33, Avenue 3, Mirpur DOHS, Dhaka-1216",
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
          { service: svc[7]._id, serviceName: "Shoe Cleaning", quantity: 2, price: 15.00, subtotal: 30.00 },
        ],
        itemCount: 2, itemsSummary: "2 Shoe Cleaning",
        orderDate: daysAgo(5), deliveryDate: daysAgo(-2),
        status: "cancelled", subtotal: 30.00, discount: 0, totalPayment: 30.00,
        paymentMethod: "card", paymentStatus: "refunded",
        address: "Block-A, Road #5, Bashundhara R/A, Dhaka-1229",
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
        comment: "The stain removal team worked magic! A turmeric stain that I thought was permanent is completely gone. Amazing work!",
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
