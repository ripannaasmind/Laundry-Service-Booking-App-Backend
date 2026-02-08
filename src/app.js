import express from 'express';
import router from './routes/api.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();



// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))



// Use the API routes
app.use('/api/v1', router);

export default app;