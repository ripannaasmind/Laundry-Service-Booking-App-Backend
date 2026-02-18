import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UltraWash Laundry Service API',
      version: '1.0.0',
      description: 'Complete API documentation for UltraWash Laundry Service - A comprehensive laundry booking and management platform',
      contact: {
        name: 'UltraWash Support',
        email: 'admin@ultrawash.com',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'Auto-detect server (works from any IP/device)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login endpoint',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'failed',
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@example.com' },
            phone: { type: 'string', example: '+8801712345678' },
            role: { type: 'string', enum: ['user', 'admin', 'delivery', 'staff'], example: 'user' },
            profileImage: { type: 'string', example: 'https://example.com/photo.jpg' },
            isBlocked: { type: 'boolean', example: false },
            isAvailable: { type: 'boolean', description: 'For delivery boys only' },
            totalEarnings: { type: 'number', description: 'For delivery boys only' },
            pendingEarnings: { type: 'number', description: 'For delivery boys only' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Wash & Fold' },
            slug: { type: 'string', example: 'wash-and-fold' },
            description: { type: 'string', example: 'Professional wash and fold service' },
            price: { type: 'number', example: 12.99 },
            priceUnit: { type: 'string', example: 'per kg' },
            imageUrl: { type: 'string', example: 'https://example.com/image.jpg' },
            isActive: { type: 'boolean', example: true },
          },
        },
        Store: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'Downtown Branch' },
            slug: { type: 'string', example: 'downtown-branch' },
            address: { type: 'string', example: '456 Market St' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', example: 'Point' },
                coordinates: { type: 'array', items: { type: 'number' }, example: [90.4125, 23.8103] },
              },
            },
            phone: { type: 'string', example: '+8801712345678' },
            email: { type: 'string', example: 'downtown@ultrawash.com' },
            openingHours: { type: 'string', example: 'Mon-Sat: 8AM-8PM' },
            isActive: { type: 'boolean', example: true },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderId: { type: 'string', example: 'UW-1234567890' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  service: { type: 'string', example: '507f1f77bcf86cd799439011' },
                  quantity: { type: 'number', example: 5 },
                  price: { type: 'number', example: 12.99 },
                  subtotal: { type: 'number', example: 64.95 },
                },
              },
            },
            totalPayment: { type: 'number', example: 79.95 },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'pickup_assigned', 'picked_up', 'at_warehouse', 'processing', 'cleaned', 'ready', 'delivery_assigned', 'out_for_delivery', 'delivered', 'cancelled'],
              example: 'pending',
            },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'refunded'], example: 'pending' },
            paymentMethod: { type: 'string', enum: ['cash', 'card', 'online'], example: 'card' },
            pickupDate: { type: 'string', format: 'date-time' },
            deliveryDate: { type: 'string', format: 'date-time' },
            deliveryBoy: { type: 'string', description: 'Delivery boy user ID' },
            pickupDeliveryBoy: { type: 'string', description: 'Pickup delivery boy user ID' },
            staff: { type: 'string', description: 'Cleaning staff user ID' },
            pickupCharge: { type: 'number', example: 50 },
            deliveryCharge: { type: 'number', example: 50 },
            billingInfo: {
              type: 'object',
              properties: {
                fullName: { type: 'string' },
                phone: { type: 'string' },
                address: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Coupon: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            code: { type: 'string', example: 'SUMMER20' },
            discountType: { type: 'string', enum: ['percentage', 'fixed'], example: 'percentage' },
            discountValue: { type: 'number', example: 20 },
            minOrderValue: { type: 'number', example: 50 },
            maxDiscount: { type: 'number', example: 100 },
            usageLimit: { type: 'number', example: 100 },
            perUserLimit: { type: 'number', example: 1 },
            usedCount: { type: 'number', example: 25 },
            validFrom: { type: 'string', format: 'date-time' },
            validUntil: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean', example: true },
          },
        },
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            order: { type: 'string', example: '507f1f77bcf86cd799439011' },
            user: { type: 'string', example: '507f1f77bcf86cd799439011' },
            rating: { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment: { type: 'string', example: 'Excellent service!' },
            isApproved: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Authentication', description: 'User authentication - register, login, Google auth, OTP, password reset, profile' },
      { name: 'Services', description: 'Laundry services (public)' },
      { name: 'Stores', description: 'Store locations (public)' },
      { name: 'Orders', description: 'Order management (user)' },
      { name: 'Coupons', description: 'Coupon validation (user)' },
      { name: 'Reviews', description: 'Customer reviews' },
      { name: 'Delivery', description: 'Delivery boy operations - pickup, warehouse, delivery, earnings' },
      { name: 'Staff', description: 'Staff operations - cleaning workflow' },
      { name: 'Admin', description: 'Admin operations - full management' },
      { name: 'Notifications', description: 'User notifications' },
      { name: 'Support', description: 'Support tickets' },
      { name: 'Public', description: 'Public endpoints (no auth)' },
      { name: 'Upload', description: 'File upload' },
    ],
  },
  apis: ['./src/routes/swagger-annotations.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
