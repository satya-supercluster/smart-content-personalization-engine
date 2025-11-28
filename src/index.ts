import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import personalizationRoutes from './routes/personalize';
import metricsRoutes from './routes/metrics';
import healthRoutes from './routes/health';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './services/monitoring';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`
    });
  });
  next();
});

// Routes
app.use('/api/v1', personalizationRoutes);
app.use('/api/v1', metricsRoutes);
app.use('/api/v1', healthRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`🚀 Content Personalization Engine started on port ${PORT}`);
});