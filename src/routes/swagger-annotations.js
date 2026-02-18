/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     description: Create a new customer account. Required fields are name, email, phone, password, confirmPassword. No address field needed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 description: Phone number (any format - auto-normalized)
 *                 example: "01712345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "123456"
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Registration successful
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *       400:
 *         description: Validation error or user already exists
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     description: Login with email or phone number + password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - password
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 description: Email address or phone number
 *                 example: "admin@ultrawash.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     role:
 *                       type: string
 *                       enum: [user, admin, delivery, staff]
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Authentication]
 *     summary: Google Sign In/Sign Up
 *     description: Authenticate with Google using Firebase ID token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: Firebase ID token from Google Sign-In
 *     responses:
 *       200:
 *         description: Google login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       400:
 *         description: Invalid Google token
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Forgot password - Send OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/verify-forgot-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify forgot password OTP
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - otp
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: "john@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified, returns reset token
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Reset password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - newPassword
 *               - confirmPassword
 *               - resetToken
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *               resetToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Invalid or expired reset token
 */

/**
 * @swagger
 * /auth/send-login-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Send OTP for login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: OTP sent
 *       400:
 *         description: User not found
 */

/**
 * @swagger
 * /auth/verify-login-otp:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify OTP and login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailOrPhone
 *               - otp
 *             properties:
 *               emailOrPhone:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with token
 *       400:
 *         description: Invalid or expired OTP
 */

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Authentication]
 *     summary: Get user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags: [Authentication]
 *     summary: Update user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               profileImage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */

/**
 * @swagger
 * /services:
 *   get:
 *     tags: [Services]
 *     summary: Get all active services
 *     responses:
 *       200:
 *         description: Services list
 */

/**
 * @swagger
 * /services/{slug}:
 *   get:
 *     tags: [Services]
 *     summary: Get service by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: wash-and-fold
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /stores:
 *   get:
 *     tags: [Stores]
 *     summary: Get all active stores
 *     responses:
 *       200:
 *         description: Stores list
 */

/**
 * @swagger
 * /stores/nearby:
 *   get:
 *     tags: [Stores]
 *     summary: Get nearby stores
 *     parameters:
 *       - in: query
 *         name: latitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: longitude
 *         required: true
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxDistance
 *         schema:
 *           type: integer
 *           default: 10000
 *     responses:
 *       200:
 *         description: Nearby stores
 */

/**
 * @swagger
 * /stores/{slug}:
 *   get:
 *     tags: [Stores]
 *     summary: Get store by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store details
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create new order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - pickupDate
 *               - deliveryDate
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               pickupDate:
 *                 type: string
 *                 format: date-time
 *               deliveryDate:
 *                 type: string
 *                 format: date-time
 *               couponCode:
 *                 type: string
 *               paymentMethod:
 *                 type: string
 *                 enum: [cash, card, online]
 *               billingInfo:
 *                 type: object
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phone:
 *                     type: string
 *                   address:
 *                     type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get my orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Orders list with pagination
 */

/**
 * @swagger
 * /orders/dashboard-stats:
 *   get:
 *     tags: [Orders]
 *     summary: Get user dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order cancelled
 */

/**
 * @swagger
 * /coupons/active:
 *   get:
 *     tags: [Coupons]
 *     summary: Get active coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active coupons list
 */

/**
 * @swagger
 * /coupons/validate:
 *   post:
 *     tags: [Coupons]
 *     summary: Validate coupon code
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - orderTotal
 *             properties:
 *               code:
 *                 type: string
 *                 example: SUMMER20
 *               orderTotal:
 *                 type: number
 *                 example: 100
 *     responses:
 *       200:
 *         description: Coupon validation result
 */

/**
 * @swagger
 * /reviews/approved:
 *   get:
 *     tags: [Reviews]
 *     summary: Get approved reviews (Public)
 *     responses:
 *       200:
 *         description: Approved reviews list
 */

/**
 * @swagger
 * /reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order
 *               - rating
 *             properties:
 *               order:
 *                 type: string
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review created
 */

/**
 * @swagger
 * /reviews/my-reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get my reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User reviews list
 */

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Update my review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     tags: [Reviews]
 *     summary: Delete my review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */

/**
 * @swagger
 * /delivery/dashboard-stats:
 *   get:
 *     tags: [Delivery]
 *     summary: Get delivery dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */

/**
 * @swagger
 * /delivery/pickup-orders:
 *   get:
 *     tags: [Delivery]
 *     summary: Get pickup orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pickup orders list
 */

/**
 * @swagger
 * /delivery/pickup/{id}:
 *   put:
 *     tags: [Delivery]
 *     summary: Confirm pickup
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pickup confirmed
 */

/**
 * @swagger
 * /delivery/warehouse/{id}:
 *   put:
 *     tags: [Delivery]
 *     summary: Confirm delivered to warehouse
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivered to warehouse
 */

/**
 * @swagger
 * /delivery/out-orders:
 *   get:
 *     tags: [Delivery]
 *     summary: Get out-for-delivery orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery orders list
 */

/**
 * @swagger
 * /delivery/start-delivery/{id}:
 *   put:
 *     tags: [Delivery]
 *     summary: Start delivery
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Out for delivery
 */

/**
 * @swagger
 * /delivery/confirm-delivery/{id}:
 *   put:
 *     tags: [Delivery]
 *     summary: Confirm delivery
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery completed
 */

/**
 * @swagger
 * /delivery/completed:
 *   get:
 *     tags: [Delivery]
 *     summary: Get completed deliveries
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Completed deliveries
 */

/**
 * @swagger
 * /delivery/location:
 *   put:
 *     tags: [Delivery]
 *     summary: Update delivery boy location
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated
 */

/**
 * @swagger
 * /delivery/earnings:
 *   get:
 *     tags: [Delivery]
 *     summary: Get delivery boy earnings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings data
 */

/**
 * @swagger
 * /staff/dashboard-stats:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff dashboard stats
 */

/**
 * @swagger
 * /staff/orders:
 *   get:
 *     tags: [Staff]
 *     summary: Get staff orders
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff orders list
 */

/**
 * @swagger
 * /staff/orders/{id}/start-cleaning:
 *   put:
 *     tags: [Staff]
 *     summary: Start cleaning
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cleaning started
 */

/**
 * @swagger
 * /staff/orders/{id}/complete-cleaning:
 *   put:
 *     tags: [Staff]
 *     summary: Complete cleaning
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cleaning completed
 */

/**
 * @swagger
 * /staff/orders/{id}:
 *   get:
 *     tags: [Staff]
 *     summary: Get order detail (Staff)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Order details
 */

/**
 * @swagger
 * /admin/dashboard-stats:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard stats
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin dashboard statistics
 */

/**
 * @swagger
 * /admin/orders:
 *   get:
 *     tags: [Admin]
 *     summary: Get all orders (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Orders with pagination
 */

/**
 * @swagger
 * /admin/orders/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get order detail (Admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full order details
 */

/**
 * @swagger
 * /admin/orders/{id}/status:
 *   put:
 *     tags: [Admin]
 *     summary: Update order status
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [confirmed, pickup_assigned, picked_up, at_warehouse, processing, cleaned, ready, delivery_assigned, out_for_delivery, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 */

/**
 * @swagger
 * /admin/orders/{id}/assign-pickup:
 *   put:
 *     tags: [Admin]
 *     summary: Assign pickup delivery boy
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryBoyId
 *             properties:
 *               deliveryBoyId:
 *                 type: string
 *               pickupCharge:
 *                 type: number
 *                 default: 50
 *     responses:
 *       200:
 *         description: Pickup assigned
 */

/**
 * @swagger
 * /admin/orders/{id}/assign-staff:
 *   put:
 *     tags: [Admin]
 *     summary: Assign cleaning staff
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - staffId
 *             properties:
 *               staffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff assigned
 */

/**
 * @swagger
 * /admin/orders/{id}/assign-delivery:
 *   put:
 *     tags: [Admin]
 *     summary: Assign delivery boy for final delivery
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deliveryBoyId
 *             properties:
 *               deliveryBoyId:
 *                 type: string
 *               deliveryCharge:
 *                 type: number
 *                 default: 50
 *     responses:
 *       200:
 *         description: Delivery assigned
 */

/**
 * @swagger
 * /admin/delivery-boys:
 *   get:
 *     tags: [Admin]
 *     summary: Get all delivery boys
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Delivery boys list with earnings info
 */

/**
 * @swagger
 * /admin/staff-list:
 *   get:
 *     tags: [Admin]
 *     summary: Get all cleaning staff
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff list
 */

/**
 * @swagger
 * /admin/settle-earnings/{deliveryBoyId}:
 *   put:
 *     tags: [Admin]
 *     summary: Settle delivery boy earnings
 *     description: Move pendingEarnings to totalEarnings (mark as paid)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: deliveryBoyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Earnings settled
 */

/**
 * @swagger
 * /admin/services:
 *   get:
 *     tags: [Admin]
 *     summary: Get all services (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All services including inactive
 *   post:
 *     tags: [Admin]
 *     summary: Create service
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               priceUnit:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Service created
 */

/**
 * @swagger
 * /admin/services/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service updated
 *   delete:
 *     tags: [Admin]
 *     summary: Delete service
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service deleted
 */

/**
 * @swagger
 * /admin/coupons:
 *   get:
 *     tags: [Admin]
 *     summary: Get all coupons
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupons list
 *   post:
 *     tags: [Admin]
 *     summary: Create coupon
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - discountType
 *               - discountValue
 *             properties:
 *               code:
 *                 type: string
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *               minOrderValue:
 *                 type: number
 *               maxDiscount:
 *                 type: number
 *               usageLimit:
 *                 type: number
 *               perUserLimit:
 *                 type: number
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Coupon created
 */

/**
 * @swagger
 * /admin/coupons/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon updated
 *   delete:
 *     tags: [Admin]
 *     summary: Delete coupon
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon deleted
 */

/**
 * @swagger
 * /admin/reviews:
 *   get:
 *     tags: [Admin]
 *     summary: Get all reviews
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All reviews
 */

/**
 * @swagger
 * /admin/reviews/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update review (approve/reject)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Review updated
 *   delete:
 *     tags: [Admin]
 *     summary: Delete review
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted
 */

/**
 * @swagger
 * /admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list
 *   post:
 *     tags: [Admin]
 *     summary: Create user (Admin)
 *     description: Admin can create users with any role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, admin, delivery, staff]
 *     responses:
 *       200:
 *         description: User created
 */

/**
 * @swagger
 * /admin/users/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User updated
 */

/**
 * @swagger
 * /admin/payments:
 *   get:
 *     tags: [Admin]
 *     summary: Get payments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payments list
 */

/**
 * @swagger
 * /admin/reports:
 *   get:
 *     tags: [Admin]
 *     summary: Get reports
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reports data
 */

/**
 * @swagger
 * /admin/settings:
 *   get:
 *     tags: [Admin]
 *     summary: Get app settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings
 *   put:
 *     tags: [Admin]
 *     summary: Update app settings
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings updated
 */

/**
 * @swagger
 * /admin/stores:
 *   get:
 *     tags: [Admin]
 *     summary: Get all stores (Admin)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All stores
 *   post:
 *     tags: [Admin]
 *     summary: Create store
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               openingHours:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *     responses:
 *       200:
 *         description: Store created
 */

/**
 * @swagger
 * /admin/stores/{id}:
 *   put:
 *     tags: [Admin]
 *     summary: Update store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store updated
 *   delete:
 *     tags: [Admin]
 *     summary: Delete store
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Store deleted
 */

/**
 * @swagger
 * /admin/notifications:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications list
 */

/**
 * @swagger
 * /admin/notifications/{id}/read:
 *   put:
 *     tags: [Admin]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Get user notifications
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User notifications
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Mark notification as read
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Marked as read
 */

/**
 * @swagger
 * /tickets:
 *   post:
 *     tags: [Support]
 *     summary: Create support ticket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: Ticket created
 */

/**
 * @swagger
 * /tickets/my-tickets:
 *   get:
 *     tags: [Support]
 *     summary: Get my tickets
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User tickets
 */

/**
 * @swagger
 * /tickets/{id}:
 *   get:
 *     tags: [Support]
 *     summary: Get ticket detail
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket details
 */

/**
 * @swagger
 * /tickets/{id}/notes:
 *   post:
 *     tags: [Support]
 *     summary: Add note to ticket
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added
 */

/**
 * @swagger
 * /public/contact-settings:
 *   get:
 *     tags: [Public]
 *     summary: Get contact settings
 *     responses:
 *       200:
 *         description: Contact settings
 */

/**
 * @swagger
 * /public/site-settings:
 *   get:
 *     tags: [Public]
 *     summary: Get public site settings
 *     responses:
 *       200:
 *         description: Site settings
 */

/**
 * @swagger
 * /public/contact-message:
 *   post:
 *     tags: [Public]
 *     summary: Submit contact message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               subject:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Message sent
 */

/**
 * @swagger
 * /upload/imgbb:
 *   post:
 *     tags: [Upload]
 *     summary: Upload image to ImgBB
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded, returns URL
 */
