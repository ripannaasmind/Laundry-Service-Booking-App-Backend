const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHVsdHJhd2FzaC5jb20iLCJ1c2VyX2lkIjoiNjk4ODM3ZjFmZDA0YTg4MTAzYzlmMTA5IiwiaWF0IjoxNzcwNjE0MzUzLCJleHAiOjE3NzA3MDA3NTN9.8cvXhXMcfd0UIJu4gBN1JDm50BS3Fj1U14F1AKwGnEw';

const stores = [
  {
    name: "Clean & Fresh Laundry - Gulshan",
    description: "Premium laundry service in Gulshan area. We provide top quality wash, dry cleaning, and ironing services with free pickup & delivery.",
    address: "Plot #25, Road #11, Block-H, Gulshan 2, Dhaka-1212",
    area: "Gulshan 2",
    city: "Dhaka",
    zipCode: "1212",
    country: "Bangladesh",
    latitude: 23.7945,
    longitude: 90.4143,
    phone: "+8801887905213",
    email: "gulshan@ultrawash.com",
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400",
    images: [
      "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400",
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400"
    ],
    rating: 5,
    totalReviews: 12,
    features: ["Free Pickup", "Express Delivery", "Dry Cleaning", "Ironing", "Shoe Cleaning"],
    isFeatured: true,
    sortOrder: 1,
    operatingHours: [
      { day: "monday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "tuesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "wednesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "thursday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "friday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "saturday", openTime: "09:00", closeTime: "22:30", isClosed: false },
      { day: "sunday", openTime: "10:00", closeTime: "20:00", isClosed: false }
    ]
  },
  {
    name: "Clean & Fresh Laundry - Banani",
    description: "Quick and reliable laundry service in Banani with same-day delivery option.",
    address: "House #45, Road #27, Banani, Dhaka-1213",
    area: "Banani",
    city: "Dhaka",
    zipCode: "1213",
    country: "Bangladesh",
    latitude: 23.7937,
    longitude: 90.4029,
    phone: "+8801887905214",
    email: "banani@ultrawash.com",
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400",
    images: [
      "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400"
    ],
    rating: 4,
    totalReviews: 8,
    features: ["Free Pickup", "Dry Cleaning", "Ironing", "Curtain Cleaning"],
    isFeatured: false,
    sortOrder: 2,
    operatingHours: [
      { day: "monday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "tuesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "wednesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "thursday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "friday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "saturday", openTime: "09:00", closeTime: "21:00", isClosed: false },
      { day: "sunday", openTime: "10:00", closeTime: "20:00", isClosed: false }
    ]
  },
  {
    name: "Clean & Fresh Laundry - Dhanmondi",
    description: "Best laundry service in Dhanmondi area with affordable prices and premium quality.",
    address: "House #12, Road #8, Dhanmondi, Dhaka-1205",
    area: "Dhanmondi",
    city: "Dhaka",
    zipCode: "1205",
    country: "Bangladesh",
    latitude: 23.7461,
    longitude: 90.3742,
    phone: "+8801887905215",
    email: "dhanmondi@ultrawash.com",
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400",
    images: [
      "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400"
    ],
    rating: 4,
    totalReviews: 15,
    features: ["Free Pickup", "Express Delivery", "Shoe Cleaning", "Carpet Cleaning"],
    isFeatured: true,
    sortOrder: 3,
    operatingHours: [
      { day: "monday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "tuesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "wednesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "thursday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "friday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "saturday", openTime: "09:00", closeTime: "22:00", isClosed: false },
      { day: "sunday", openTime: "10:00", closeTime: "20:00", isClosed: false }
    ]
  },
  {
    name: "Clean & Fresh Laundry - Uttara",
    description: "Convenient laundry service near Uttara Sector 7 with fast turnaround time.",
    address: "Plot #8, Sector 7, Uttara, Dhaka-1230",
    area: "Uttara",
    city: "Dhaka",
    zipCode: "1230",
    country: "Bangladesh",
    latitude: 23.8759,
    longitude: 90.3795,
    phone: "+8801887905216",
    email: "uttara@ultrawash.com",
    image: "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400",
    images: [
      "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=400"
    ],
    rating: 4,
    totalReviews: 6,
    features: ["Free Pickup", "Dry Cleaning", "Express Delivery"],
    isFeatured: false,
    sortOrder: 4,
    operatingHours: [
      { day: "monday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "tuesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "wednesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "thursday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "friday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      { day: "saturday", openTime: "09:00", closeTime: "22:00", isClosed: false },
      { day: "sunday", openTime: "10:00", closeTime: "20:00", isClosed: false }
    ]
  },
  {
    name: "Clean & Fresh Laundry - Mirpur",
    description: "Affordable laundry services in Mirpur with doorstep pickup and delivery.",
    address: "House #33, Avenue 3, Mirpur DOHS, Dhaka-1216",
    area: "Mirpur DOHS",
    city: "Dhaka",
    zipCode: "1216",
    country: "Bangladesh",
    latitude: 23.8088,
    longitude: 90.3654,
    phone: "+8801887905217",
    email: "mirpur@ultrawash.com",
    image: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400",
    images: [
      "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400"
    ],
    rating: 4.5,
    totalReviews: 10,
    features: ["Free Pickup", "Ironing", "Curtain Cleaning"],
    isFeatured: false,
    sortOrder: 5
  },
  {
    name: "Clean & Fresh Laundry - Bashundhara",
    description: "Modern laundry service near Bashundhara City Shopping Complex.",
    address: "Block-A, Road #5, Bashundhara R/A, Dhaka-1229",
    area: "Bashundhara",
    city: "Dhaka",
    zipCode: "1229",
    country: "Bangladesh",
    latitude: 23.8139,
    longitude: 90.4272,
    phone: "+8801887905218",
    email: "bashundhara@ultrawash.com",
    image: "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400",
    images: [
      "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=400"
    ],
    rating: 4,
    totalReviews: 5,
    features: ["Free Pickup", "Express Delivery", "Dry Cleaning", "Shoe Cleaning"],
    isFeatured: true,
    sortOrder: 6
  }
];

async function seed() {
  for (const store of stores) {
    try {
      const res = await fetch('http://127.0.0.1:3000/api/v1/admin/stores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify(store)
      });
      const data = await res.json();
      console.log(`${data.status === 'success' ? '✅' : '❌'} ${store.name}: ${data.message || data.status}`);
    } catch (err) {
      console.error(`❌ ${store.name}: ${err.message}`);
    }
  }
}

seed();
