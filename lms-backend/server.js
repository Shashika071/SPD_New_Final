import 'dotenv/config';

import ClassRouter from './routes/classRouter.js';
import adminRouter from './routes/adminRouter.js';
import cors from 'cors';
import express from 'express';
import pool from './config/db.js';
import resourcesRouter from './routes/resourcesRouter.js';
import studentReandClassRouter from './routes/studentReandClassRouter.js';
import supervisorsRouter from './routes/teacherRouter.js';
import userRouter from './routes/userRouter.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static images
app.use('/images', express.static('uploads'));

// API endpoints

app.use('/api/user', userRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/teachers', supervisorsRouter);
app.use('/api', ClassRouter);
app.use('/api', resourcesRouter);
app.use('/api', studentReandClassRouter);
// Test database connection
app.get('/test-db', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        res.json({ success: true, message: 'Database connected!', result: rows[0] });
    } catch (error) {
        console.error('Error connecting to the database:', error);
        res.status(500).json({ success: false, message: 'Error connecting to the database', error });
    }
});

// Root route
app.get('/', (req, res) => {
    res.send('API WORKING');
});

// Start the server
app.listen(port, () => {
    console.log(`Server starting on http://localhost:${port}`);
});
