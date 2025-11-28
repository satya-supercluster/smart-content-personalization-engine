import { Router, Request, Response } from 'express';
import { MetricsCollector } from '../services/monitoring';

const router = Router();

router.get('/metrics', (req: Request, res: Response) => {
  const metrics = MetricsCollector.getMetrics();
  res.json(metrics);
});

export default router;