import express from 'express';
import router from './routes/api.js';
import cors from 'cors';
const app = express();



// Middleware to parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())



// Use the API routes
app.use('/api/v1', router);

export default app;