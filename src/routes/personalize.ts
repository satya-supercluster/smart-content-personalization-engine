import { Router, Request, Response } from 'express';
import { PersonalizationService } from '../services/personalization';
import { EngagementAnalyzer } from '../services/engagement';
import { CacheService } from '../services/cache';
import { validatePersonalizationRequest } from '../middleware/validation';
import { MetricsCollector } from '../services/monitoring';

const router = Router();

router.post('/personalize', validatePersonalizationRequest, async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const { userId, contentType, template, subject } = req.body;
    
    // Check cache first
    const cacheKey = `personalization:${userId}:${contentType}`;
    const cached = await CacheService.get(cacheKey);
    
    if (cached) {
      const responseTime = Date.now() - startTime;
      MetricsCollector.recordRequest({
        endpoint: '/personalize',
        responseTime,
        statusCode: 200,
        userId,
        cached: true
      });
      
      return res.json({ ...JSON.parse(cached), cached: true });
    }
    
    // Analyze user engagement
    const engagement = await EngagementAnalyzer.analyze(userId);
    
    // Generate personalized content
    const result = await PersonalizationService.generate({
      userId,
      engagement,
      contentType,
      template,
      subject
    });
    
    // Cache result (1 hour TTL)
    await CacheService.set(cacheKey, JSON.stringify(result), 3600);
    
    const responseTime = Date.now() - startTime;
    MetricsCollector.recordRequest({
      endpoint: '/personalize',
      responseTime,
      statusCode: 200,
      userId,
      cached: false
    });
    
    res.json({ ...result, cached: false });
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    MetricsCollector.recordRequest({
      endpoint: '/personalize',
      responseTime,
      statusCode: 500,
      cached: false
    });
    
    throw error;
  }
});

// Batch personalization endpoint
router.post('/personalize/batch', async (req: Request, res: Response) => {
  try {
    const { requests } = req.body;
    
    const results = await Promise.all(
      requests.map(async (request: any) => {
        try {
          const engagement = await EngagementAnalyzer.analyze(request.userId);
          return await PersonalizationService.generate({
            ...request,
            engagement
          });
        } catch (error) {
          return { error: 'Failed to personalize', userId: request.userId };
        }
      })
    );
    
    res.json({ results });
  } catch (error) {
    throw error;
  }
});

export default router;