# UltraWash Laundry Service - Complete API Documentation

> **Base URL:** `http://localhost:3000/api/v1`
> **Frontend URL:** `http://localhost:3001`

---

## 📋 Table of Contents

1. [Login Credentials](#login-credentials)
2. [Role-Based Capabilities](#role-based-capabilities)
3. [Order Workflow](#order-workflow)
4. [Store Locations](#store-locations)
5. [Services & Pricing](#services--pricing)
6. [API Endpoints](#api-endpoints)
   - [Authentication](#1-authentication-routes)
   - [Services (Public)](#2-service-routes-public)
   - [Stores (Public)](#3-store-routes-public)
   - [Orders (Customer)](#4-order-routes-customer)
   - [Coupons](#5-coupon-routes)
   - [Reviews](#6-review-routes)
   - [Delivery Boy](#7-delivery-boy-routes)
   - [Staff](#8-staff-routes)
   - [Admin](#9-admin-routes)

---

## 🔐 Login Credentials

> **All passwords:** `123456`

| Role | Email | Frontend URL |
|------|-------|-------------|
| **Admin** | `admin@ultrawash.com` | `/admin/login` → `/admin` |
| **Delivery Boy 1** | `delivery1@ultrawash.com` | `/delivery/login` → `/delivery` |
| **Delivery Boy 2** | `delivery2@ultrawash.com` | `/delivery/login` → `/delivery` |
| **Delivery Boy 3** | `delivery3@ultrawash.com` | `/delivery/login` → `/delivery` |
| **Staff 1** | `staff1@ultrawash.com` | `/staff/login` → `/staff` |
| **Staff 2** | `staff2@ultrawash.com` | `/staff/login` → `/staff` |
| **Staff 3** | `staff3@ultrawash.com` | `/staff/login` → `/staff` |
| **Customer** | *(Register via `/signup`)* | `/login` → `/dashboard` |

---

## 👥 Role-Based Capabilities

### 🛒 Customer (role: `user`)
| Feature | Frontend Page | Description |
|---------|--------------|-------------|
| Browse Services | `/services` | View all laundry services with pricing |
| Service Detail | `/services/[slug]` | Select items, add to cart |
| Cart | `/cart` | View/modify selected items |
| Checkout | `/checkout` | Place order with address & payment |
| My Orders | `/dashboard/orders` | View all orders with status |
| Order Detail | `/dashboard/orders/[id]` | Track order, cancel if pending |
| Write Review | `/dashboard/orders/[id]` | Rate & review after delivery ⭐ |
| My Reviews | `/dashboard/reviews` | View/edit/delete my reviews |
| Profile | `/dashboard/profile` | Update name, phone, address |
| Settings | `/dashboard/settings` | Change password, preferences |
| Nearby Stores | `/stores` | Find nearest UltraWash stores |
| Notifications | `/notifications` | View order updates |
| Payment Methods | `/dashboard/payment-method` | Manage payment options |

### 🚚 Delivery Boy (role: `delivery`)
| Feature | Frontend Page | Description |
|---------|--------------|-------------|
| Dashboard | `/delivery` | Stats: today's pickups, deliveries, earnings |
| Assigned Orders | `/delivery/assigned` | View pickup & delivery assigned orders |
| Pickup Orders | `/delivery/pickup` | Confirm pickup → Deliver to warehouse |
| In-Transit | `/delivery/in-transit` | Start delivery → Confirm delivered |
| Completed | `/delivery/completed` | View completed deliveries & earnings |

**Workflow:**
1. Admin assigns pickup → Delivery boy sees in **Assigned (Pickup Tab)**
2. Confirm pickup → Status: `picked_up`
3. Deliver to warehouse → Status: `at_warehouse`
4. Admin assigns staff for cleaning
5. After cleaning done, admin assigns delivery
6. Delivery boy sees in **Assigned (Delivery Tab)**
7. Start delivery → Status: `out_for_delivery`
8. Confirm delivered → Status: `delivered` ✅

### 🧹 Staff (role: `staff`)
| Feature | Frontend Page | Description |
|---------|--------------|-------------|
| Dashboard | `/staff` | Stats: assigned, in cleaning, done today, total |
| Orders | `/staff/orders` | View assigned orders with 3 filter tabs |
| Start Cleaning | `/staff/orders` | Mark order as `in_process` |
| Complete Cleaning | `/staff/orders` | Mark order as `cleaned` with notes |

**Workflow:**
1. Admin assigns staff to an order at warehouse
2. Staff sees order in **Assigned** tab
3. Start cleaning → Status: `in_process`
4. Complete cleaning (with notes) → Status: `cleaned`

### 🛡️ Admin (role: `admin`)
| Feature | Frontend Page | Description |
|---------|--------------|-------------|
| Dashboard | `/admin` | Revenue, orders, team stats, charts |
| Orders | `/admin/orders` | All orders, 12 status tabs, 3 assignment modals |
| Assign Pickup | `/admin/orders` | Assign delivery boy for pickup |
| Assign Staff | `/admin/orders` | Assign staff for cleaning |
| Assign Delivery | `/admin/orders` | Assign delivery boy for delivery |
| Services CRUD | `/admin/services` | Create/edit/delete services |
| Users | `/admin/users` | View/manage all users |
| Reviews | `/admin/reviews` | Approve/reject/delete reviews |
| Coupons | `/admin/coupons` | Create/manage discount coupons |
| Payments | `/admin/payments` | View payment records |
| Reports | `/admin/reports` | Revenue & order reports |
| Settings | `/admin/settings` | App-wide settings |
| Delivery Settlement | `/admin/orders` | Settle delivery boy earnings |

---

## 📦 Order Workflow (12 Statuses)

```
pending → confirmed → pickup_assigned → picked_up → at_warehouse
    → in_process → cleaned → ready → delivery_assigned
    → out_for_delivery → delivered
                                        
pending → cancelled (customer can cancel only if pending)
```

| Status | Who Changes | Action |
|--------|------------|--------|
| `pending` | System | Order created by customer |
| `confirmed` | Admin | Admin confirms order |
| `pickup_assigned` | Admin | Admin assigns delivery boy for pickup |
| `picked_up` | Delivery Boy | Delivery boy confirms pickup |
| `at_warehouse` | Delivery Boy | Delivery boy drops at warehouse |
| `in_process` | Staff | Staff starts cleaning |
| `cleaned` | Staff | Staff completes cleaning |
| `ready` | Admin | Admin marks ready for delivery |
| `delivery_assigned` | Admin | Admin assigns delivery boy |
| `out_for_delivery` | Delivery Boy | Delivery boy starts delivery |
| `delivered` | Delivery Boy | Delivery boy confirms delivered ✅ |
| `cancelled` | Customer | Customer cancels (only from pending) |

---

## 🏪 Store Locations (Dhaka, Bangladesh)

| Store | Area | Coordinates (lat, lng) | Features |
|-------|------|----------------------|----------|
| UltraWash Gulshan | Gulshan-2 | 23.7925, 90.4078 | Free Pickup, Express, Dry Cleaning, 24/7 |
| UltraWash Dhanmondi | Dhanmondi-27 | 23.7465, 90.3762 | Free Pickup, Same Day, Eco-Friendly |
| UltraWash Banani | Banani-11 | 23.7937, 90.4033 | Free Pickup, Express, Premium Care |
| UltraWash Uttara | Uttara Sector-7 | 23.8759, 90.3795 | Free Pickup, Bulk Discount, Student |
| UltraWash Mirpur | Mirpur-10 | 23.8223, 90.3654 | Free Pickup, Budget Friendly, Fast |
| UltraWash Mohammadpur | Mohammadpur | 23.7662, 90.3588 | Free Pickup, Family Package, Monthly |

> Reviews are auto-linked to the nearest store (within 15km) based on order's customer location using MongoDB `$near` geospatial query.

---

## 💰 Services & Pricing

| Service | Type | Price | Category |
|---------|------|-------|----------|
| Wash & Fold | per_kg | ৳60/kg | washing |
| Wash & Iron | per_kg | ৳80/kg | washing |
| Dry Cleaning | per_item | ৳250/item | dry_cleaning |
| Ironing Only | per_item | ৳30/item | ironing |
| Premium Laundry | per_item | ৳400/item | premium |
| Curtain Cleaning | per_item | ৳300/item | specialty |
| Shoe Cleaning | per_item | ৳200/item | specialty |
| Bedding & Linen | per_item | ৳150/item | specialty |

---

## 🔌 API Endpoints

### 1. Authentication Routes

> No auth required for register/login. Token required for profile.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | ❌ | Register new customer |
| `POST` | `/auth/login` | ❌ | Login (returns token + role) |
| `POST` | `/auth/google` | ❌ | Google Sign-In |
| `POST` | `/auth/forgot-password` | ❌ | Send password reset OTP |
| `POST` | `/auth/verify-forgot-otp` | ❌ | Verify forgot password OTP |
| `POST` | `/auth/reset-password` | ❌ | Reset password with OTP |
| `POST` | `/auth/send-login-otp` | ❌ | Send login OTP to phone/email |
| `POST` | `/auth/verify-login-otp` | ❌ | Verify login OTP |
| `POST` | `/auth/logout` | ✅ User | Logout (invalidate token) |
| `GET` | `/auth/profile` | ✅ User | Get current user profile |
| `PUT` | `/auth/profile` | ✅ User | Update profile |

#### Register
```
POST /auth/register
Body: { name, email, phone, password }
Response: { success: true, message, data: { user, token } }
```

#### Login
```
POST /auth/login
Body: { email, password }
Response: { success: true, data: { user: { _id, name, email, role }, token } }
```

#### Google Auth
```
POST /auth/google
Body: { idToken }
Response: { success: true, data: { user, token } }
```

#### Get Profile
```
GET /auth/profile
Headers: { Authorization: "Bearer <token>" }
Response: { success: true, data: { _id, name, email, phone, role, address, ... } }
```

#### Update Profile
```
PUT /auth/profile
Headers: { Authorization: "Bearer <token>" }
Body: { name?, phone?, address? }
Response: { success: true, data: { updated user } }
```

---

### 2. Service Routes (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/services` | ❌ | Get all active services |
| `GET` | `/services/:slug` | ❌ | Get service by slug |

#### Get All Services
```
GET /services
Response: { success: true, data: [
  { _id, name, slug, description, pricingType, pricePerKg, pricePerItem,
    category, items: [{ name, price }], features, image, isActive }
] }
```

#### Get Service by Slug
```
GET /services/wash-and-fold
Response: { success: true, data: { ...service details with items array } }
```

---

### 3. Store Routes (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/stores` | ❌ | Get all stores |
| `GET` | `/stores/nearby` | ❌ | Get nearby stores by coordinates |
| `GET` | `/stores/:slug` | ❌ | Get store by slug |

#### Get All Stores
```
GET /stores
Response: { success: true, data: [
  { _id, name, slug, address, area, city, location: { type, coordinates },
    phone, email, rating, totalReviews, services: [...], features, operatingHours,
    isFeatured, isActive }
] }
```

#### Get Nearby Stores
```
GET /stores/nearby?lat=23.79&lng=90.41&maxDistance=10000
Query: lat (required), lng (required), maxDistance (optional, meters, default 15000)
Response: { success: true, data: [ ...stores sorted by distance ] }
```

---

### 4. Order Routes (Customer)

> All require `Authorization: Bearer <token>`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/orders` | ✅ User | Create new order |
| `GET` | `/orders/my-orders` | ✅ User | Get my orders (paginated) |
| `GET` | `/orders/dashboard-stats` | ✅ User | Get customer dashboard stats |
| `GET` | `/orders/:id` | ✅ User | Get order by ID |
| `PUT` | `/orders/:id/cancel` | ✅ User | Cancel order (pending only) |

#### Create Order
```
POST /orders
Headers: { Authorization: "Bearer <token>" }
Body: {
  service: "<service_id>",
  items: [{ name: "T-Shirt", quantity: 3, price: 250 }],
  totalAmount: 750,
  customerLocation: { type: "Point", coordinates: [90.4078, 23.7925] },
  address: "House 12, Road 5, Gulshan-2, Dhaka",
  phone: "+8801712345678",
  scheduledPickup: "2025-01-15T10:00:00Z",
  paymentMethod: "cod",
  notes: "Handle with care"
}
Response: { success: true, data: { order with orderId like "ORD-1736..." } }
```

#### Get My Orders
```
GET /orders/my-orders?page=1&limit=10&status=delivered
Response: { success: true, data: { orders: [...], pagination: { page, limit, total, pages } } }
```

#### Get Dashboard Stats
```
GET /orders/dashboard-stats
Response: { success: true, data: { totalOrders, activeOrders, completedOrders, totalSpent } }
```

#### Cancel Order
```
PUT /orders/:id/cancel
Response: { success: true, message: "Order cancelled", data: { order } }
// Only works if order.status === 'pending'
```

---

### 5. Coupon Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/coupons/active` | ✅ User | Get active coupons |
| `POST` | `/coupons/validate` | ✅ User | Validate coupon code |

#### Validate Coupon
```
POST /coupons/validate
Body: { code: "SAVE20", orderAmount: 500 }
Response: { success: true, data: { discount: 100, finalAmount: 400 } }
```

---

### 6. Review Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/reviews/approved` | ❌ | Get all approved reviews (public) |
| `GET` | `/reviews/store/:storeId` | ❌ | Get reviews for a specific store |
| `POST` | `/reviews` | ✅ User | Create a review (for delivered orders) |
| `GET` | `/reviews/my-reviews` | ✅ User | Get my reviews |
| `PUT` | `/reviews/:id` | ✅ User | Update my review |
| `DELETE` | `/reviews/:id` | ✅ User | Delete my review |

#### Create Review
```
POST /reviews
Headers: { Authorization: "Bearer <token>" }
Body: {
  order: "<order_id>",
  service: "<service_id>",
  rating: 5,
  comment: "Excellent service! Very clean clothes."
}
Response: { success: true, data: { review with auto-linked store } }
// ⚠️ Order must be "delivered" status
// ⚠️ One review per order
// ⚠️ Auto-links to nearest store within 15km
// ⚠️ Auto-approved, store rating recalculated
```

#### Get Store Reviews
```
GET /reviews/store/:storeId?page=1&limit=10
Response: { success: true, data: { reviews: [...], pagination: { page, limit, total, pages } } }
```

#### Get My Reviews
```
GET /reviews/my-reviews
Response: { success: true, data: [
  { _id, order: { orderId, status }, service: { name }, store: { name },
    rating, comment, status, createdAt }
] }
```

---

### 7. Delivery Boy Routes

> All require `Authorization: Bearer <token>` + role: `delivery`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/delivery/dashboard-stats` | ✅ Delivery | Dashboard statistics |
| `GET` | `/delivery/pickup-orders` | ✅ Delivery | Orders assigned for pickup |
| `PUT` | `/delivery/pickup/:id` | ✅ Delivery | Confirm pickup |
| `PUT` | `/delivery/warehouse/:id` | ✅ Delivery | Mark delivered to warehouse |
| `GET` | `/delivery/out-orders` | ✅ Delivery | Orders for outgoing delivery |
| `PUT` | `/delivery/start-delivery/:id` | ✅ Delivery | Start delivery |
| `PUT` | `/delivery/confirm-delivery/:id` | ✅ Delivery | Confirm delivered to customer |
| `GET` | `/delivery/completed` | ✅ Delivery | Completed deliveries |
| `PUT` | `/delivery/location` | ✅ Delivery | Update current GPS location |
| `GET` | `/delivery/earnings` | ✅ Delivery | View earnings summary |

#### Dashboard Stats
```
GET /delivery/dashboard-stats
Response: { success: true, data: {
  todayPickups, todayDeliveries, totalCompleted,
  todayEarnings, totalEarnings, unsettledEarnings
} }
```

#### Confirm Pickup
```
PUT /delivery/pickup/:orderId
Response: { success: true, data: { order (status: picked_up) } }
```

#### Deliver to Warehouse
```
PUT /delivery/warehouse/:orderId
Response: { success: true, data: { order (status: at_warehouse) } }
```

#### Start Delivery
```
PUT /delivery/start-delivery/:orderId
Response: { success: true, data: { order (status: out_for_delivery) } }
```

#### Confirm Delivered
```
PUT /delivery/confirm-delivery/:orderId
Response: { success: true, data: { order (status: delivered) } }
// ✅ Delivery charge added to earnings
```

#### Update Location
```
PUT /delivery/location
Body: { latitude: 23.81, longitude: 90.41 }
Response: { success: true, message: "Location updated" }
```

#### Earnings
```
GET /delivery/earnings?page=1
Response: { success: true, data: {
  totalEarnings, settledEarnings, unsettledEarnings,
  orders: [{ orderId, deliveryCharge, settledAt, ... }]
} }
```

---

### 8. Staff Routes

> All require `Authorization: Bearer <token>` + role: `staff`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/staff/dashboard-stats` | ✅ Staff | Dashboard statistics |
| `GET` | `/staff/orders` | ✅ Staff | Get assigned orders |
| `PUT` | `/staff/orders/:id/start-cleaning` | ✅ Staff | Start cleaning process |
| `PUT` | `/staff/orders/:id/complete-cleaning` | ✅ Staff | Mark cleaning complete |
| `GET` | `/staff/orders/:id` | ✅ Staff | Get order detail |

#### Dashboard Stats
```
GET /staff/dashboard-stats
Response: { success: true, data: {
  assignedOrders, inProcessOrders, completedToday, totalCompleted
} }
```

#### Get Orders
```
GET /staff/orders?status=at_warehouse
Query: status (optional): at_warehouse | in_process | cleaned
Response: { success: true, data: [ ...orders ] }
```

#### Start Cleaning
```
PUT /staff/orders/:orderId/start-cleaning
Response: { success: true, data: { order (status: in_process) } }
```

#### Complete Cleaning
```
PUT /staff/orders/:orderId/complete-cleaning
Body: { notes: "All items cleaned and pressed" }
Response: { success: true, data: { order (status: cleaned) } }
```

---

### 9. Admin Routes

> All require `Authorization: Bearer <token>` + role: `admin`

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/dashboard-stats` | Revenue, orders, team stats |

```
GET /admin/dashboard-stats
Response: { success: true, data: {
  totalRevenue, monthlyRevenue, totalOrders, pendingOrders,
  activeOrders, completedOrders, cancelledOrders,
  totalCustomers, totalDeliveryBoys, totalStaff,
  recentOrders: [...], monthlyChart: [{ month, revenue, orders }]
} }
```

#### Services CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/services` | Get all services (including inactive) |
| `POST` | `/admin/services` | Create new service |
| `PUT` | `/admin/services/:id` | Update service |
| `DELETE` | `/admin/services/:id` | Delete service |

```
POST /admin/services
Body: {
  name: "Express Wash", slug: "express-wash", description: "...",
  pricingType: "per_kg", pricePerKg: 100, category: "washing",
  items: [{ name: "Regular", price: 100 }], features: ["Fast", "Premium"],
  image: "url"
}
```

#### Orders Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/orders` | Get all orders (filters: status, page) |
| `PUT` | `/admin/orders/:id/status` | Update order status |
| `PUT` | `/admin/orders/:id/assign-pickup` | Assign delivery boy for pickup |
| `PUT` | `/admin/orders/:id/assign-staff` | Assign staff for cleaning |
| `PUT` | `/admin/orders/:id/assign-delivery` | Assign delivery boy for delivery |

```
GET /admin/orders?status=pending&page=1&limit=20
Response: { success: true, data: { orders: [...], pagination: {...} } }

PUT /admin/orders/:id/assign-pickup
Body: { deliveryBoyId: "<user_id>" }
Response: { success: true, data: { order (status: pickup_assigned) } }

PUT /admin/orders/:id/assign-staff
Body: { staffId: "<user_id>" }
Response: { success: true, data: { order } }

PUT /admin/orders/:id/assign-delivery
Body: { deliveryBoyId: "<user_id>" }
Response: { success: true, data: { order (status: delivery_assigned) } }

PUT /admin/orders/:id/status
Body: { status: "confirmed" }
```

#### Delivery Boys & Staff
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/delivery-boys` | Get all delivery boys (with optional nearby filter) |
| `GET` | `/admin/staff-list` | Get all staff members |
| `PUT` | `/admin/settle-earnings/:deliveryBoyId` | Settle delivery boy earnings |

```
GET /admin/delivery-boys?lat=23.79&lng=90.41
Response: { success: true, data: [{ _id, name, email, phone, currentLocation }] }

GET /admin/staff-list
Response: { success: true, data: [{ _id, name, email, phone }] }

PUT /admin/settle-earnings/:deliveryBoyId
Response: { success: true, data: { settled amount } }
```

#### Coupons CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/coupons` | Get all coupons |
| `POST` | `/admin/coupons` | Create coupon |
| `PUT` | `/admin/coupons/:id` | Update coupon |
| `DELETE` | `/admin/coupons/:id` | Delete coupon |

```
POST /admin/coupons
Body: {
  code: "SAVE20", discountType: "percentage", discountValue: 20,
  minOrderAmount: 200, maxDiscount: 100,
  startDate: "2025-01-01", endDate: "2025-12-31",
  usageLimit: 100, isActive: true
}
```

#### Reviews Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/reviews` | Get all reviews |
| `PUT` | `/admin/reviews/:id` | Update review (approve/reject/reply) |
| `DELETE` | `/admin/reviews/:id` | Delete review |

```
PUT /admin/reviews/:id
Body: { status: "approved", adminReply: "Thank you for your feedback!" }
```

#### Users Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/users` | Get all users (paginated, filterable) |
| `PUT` | `/admin/users/:id` | Update user (role, status) |

```
GET /admin/users?page=1&role=user
PUT /admin/users/:id
Body: { role: "delivery", isVerified: true }
```

#### Payments & Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/payments` | Get all payment records |
| `GET` | `/admin/reports` | Revenue & order reports |

#### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/settings` | Get app settings |
| `PUT` | `/admin/settings` | Update app settings |

#### Stores CRUD
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/admin/stores` | Get all stores |
| `POST` | `/admin/stores` | Create new store |
| `PUT` | `/admin/stores/:id` | Update store |
| `DELETE` | `/admin/stores/:id` | Delete store |

```
POST /admin/stores
Body: {
  name: "UltraWash Chittagong", slug: "ultrawash-chittagong",
  address: "GEC Circle, Chittagong", area: "GEC", city: "Chittagong",
  location: { type: "Point", coordinates: [91.8123, 22.3569] },
  phone: "+8801700000007", email: "chittagong@ultrawash.com",
  services: ["<service_id_1>", "<service_id_2>"],
  operatingHours: { open: "08:00", close: "22:00" },
  features: ["Free Pickup", "Express"],
  isFeatured: true
}
```

---

## 🔑 Authentication

All protected endpoints require the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

The token is returned from `/auth/login`, `/auth/register`, or `/auth/google`.

### Role Hierarchy:
- **User (customer)**: Can access `/orders/*`, `/reviews/*`, `/coupons/*`
- **Delivery**: Can access `/delivery/*` + all user routes
- **Staff**: Can access `/staff/*` + all user routes
- **Admin**: Can access `/admin/*` + all routes

---

## 📊 Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description here"
}
```

Common HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient role)
- `404` - Not Found
- `500` - Internal Server Error

---

## 🔄 Quick Test Commands (cURL)

### Login as Admin
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ultrawash.com","password":"123456"}'
```

### Login as Delivery Boy
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"delivery1@ultrawash.com","password":"123456"}'
```

### Login as Staff
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"staff1@ultrawash.com","password":"123456"}'
```

### Get All Services
```bash
curl http://localhost:3000/api/v1/services
```

### Get Nearby Stores
```bash
curl "http://localhost:3000/api/v1/stores/nearby?lat=23.79&lng=90.41"
```

### Create Order (with token)
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -d '{
    "service": "<service_id>",
    "items": [{"name":"T-Shirt","quantity":3,"price":60}],
    "totalAmount": 180,
    "address": "Gulshan-2, Dhaka",
    "phone": "+8801712345678",
    "paymentMethod": "cod"
  }'
```

---

## 📝 Total API Count Summary

| Category | Count | Auth |
|----------|-------|------|
| Authentication | 11 | Mixed |
| Services (Public) | 2 | ❌ |
| Stores (Public) | 3 | ❌ |
| Orders (Customer) | 5 | ✅ User |
| Coupons | 2 | ✅ User |
| Reviews | 6 | Mixed |
| Delivery Boy | 10 | ✅ Delivery |
| Staff | 5 | ✅ Staff |
| Admin | 24 | ✅ Admin |
| **Total** | **68 endpoints** | |

---

*Generated for UltraWash Laundry Service Booking App*
*Backend: Express.js + MongoDB Atlas | Frontend: Next.js 16*
*Currency: ৳ (BDT - Bangladeshi Taka)*
