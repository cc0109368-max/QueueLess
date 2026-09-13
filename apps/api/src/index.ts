import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import express from 'express';
import cors from 'cors';
import http from 'http';
import { authRouter } from './routes/auth.routes';
import { publicRouter } from './routes/public.routes';
import { adminRouter } from './routes/admin.routes';
import { counterRouter } from './routes/counter.routes';
import { errorHandler } from './middleware/errorHandler';
import { socketManager } from './socket/socketManager';

const app = express();
const server = http.createServer(app);

// CORS
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174,http://localhost:3000').split(',');
app.use(cors({ origin: corsOrigins, credentials: true }));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Initialize WebSocket
socketManager.initialize(server);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'queueless-api', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/admin', adminRouter);
app.use('/api/counter', counterRouter);

// Error handler
app.use(errorHandler);

// Start
const PORT = parseInt(process.env.PORT || process.env.API_PORT || '4000', 10);
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`\n🚀 QueueLess API running on http://localhost:${PORT}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health\n`);
  });
}

export { app, server };
