import { Router, Request, Response } from 'express';
import { pool } from '../config/database';
import { CacheService } from '../services/cache';

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database
    await pool.query('SELECT 1');
    
    // Check Redis
    await CacheService.get('health_check');
    
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      services: {
        database: 'connected',
        cache: 'connected'
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

export default router;
