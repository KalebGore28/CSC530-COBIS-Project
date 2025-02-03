import express from 'express';
import cors from 'cors';

// Import Middleware

// Import Routes
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import importHistoryRoutes from './routes/importHistoryRoutes.js';
import collegesRoutes from './routes/collegesRoutes.js';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/departments', departmentRoutes);
app.use('/courses', courseRoutes);
app.use('/import-history', importHistoryRoutes);
app.use('/colleges', collegesRoutes);

export default app;