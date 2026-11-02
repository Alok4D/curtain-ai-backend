import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import config from './app/config';
import router from './app/routes';
import globalErrorHandler from './app/middlwares/globalErrorHandler';
import notFound from './app/middlwares/notFound';

const app: Application = express();

// Parsers with 50mb limit for AI room image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  config.client_url,
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly permissive
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// Application routes
app.use('/api/v1', router);

// Root Healthcheck
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: '✨ Curtain AI AI Studio Engine & Management Backend API is Live!',
    version: '1.0.0',
    documentation: '/api/v1',
  });
});

// Global error handler
app.use(globalErrorHandler);

// Not found route handler
app.use(notFound);

export default app;
