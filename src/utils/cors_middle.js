export const corsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;

  // Allow all origins for maximum accessibility
  res.header("Access-Control-Allow-Origin", origin || "*");

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
};
