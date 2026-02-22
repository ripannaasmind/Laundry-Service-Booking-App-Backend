import express from 'express';
import router from './routes/api.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

// CORS — allow all origins in development for LAN device access
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : true, // true = reflect request origin (allow all)
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'UltraWash API Docs',
}));

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Use the API routes
app.use('/api/v1', router);

// Health Check — accessible in browser at /health or /
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: '🧺 Ultra Wash API is running',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

app.get('/', (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Ultra Wash API</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f0f4f8; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .card { background: white; border-radius: 12px; padding: 40px 50px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); text-align: center; }
        h1 { color: #2563eb; margin-bottom: 8px; }
        p { color: #555; margin: 6px 0; }
        .badge { display: inline-block; background: #22c55e; color: white; padding: 4px 14px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
        a { color: #2563eb; text-decoration: none; font-weight: bold; }
        a:hover { text-decoration: underline; }
        .links { margin-top: 20px; display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>🧺 Ultra Wash</h1>
        <p>Laundry Service Booking API</p>
        <span class="badge">✅ Server Running</span>
        <div class="links">
          <a href="/health">Health Check</a>
          <a href="/api-docs">API Docs</a>
          <a href="/api/v1/public/site-settings">Site Settings</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

export default app;
