export const corsMiddleware = (req, res, next) => {
 const allowedOrigin = process.env.NODE_ENV === "production" 
 ? "https://ecommerce-project-2-vnrd.onrender.com" 
 : "http://localhost:5173/";
 const origin = req.headers.origin;

// 1. No ‘Access-Control-Allow-Origin’ Header
 if (origin === allowedOrigin) {
 res.header("Access-Control-Allow-Origin", origin);
 } else {
 console.log(`Origin mismatch: ${origin} vs ${allowedOrigin}`);
 }

// 2. Credentials Not Allowed
 res.header("Access-Control-Allow-Credentials", true);

// 3. Method Not Allowed
 res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");

// 4. No ‘Access-Control-Allow-Headers’ Header
 res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

// 5. Preflight Request Handling (OPTIONS request)
 if (req.method === "OPTIONS") {
 return res.status(200).end();
 }

next();
};