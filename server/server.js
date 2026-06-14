import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import resumeRouter from './routes/resumeRoutes.js';
import aiRouter from './routes/aiRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const clientDistPath = path.join(__dirname, '../client/dist');

await connectDB();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin requests, server-to-server requests, Postman, curl, etc.
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'Server is running...' });
});

// API routes
app.use('/api/user', userRouter);
app.use('/api/users', userRouter);
app.use('/api/resumes', resumeRouter);
app.use('/api/ai', aiRouter);

// Serve React/Vite frontend from the same Express server in production.
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  // React Router fallback. Express 5 works safely with RegExp route.
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is running. Client build not found. Run: npm run build --prefix client');
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
