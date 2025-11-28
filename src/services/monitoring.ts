import winston from 'winston';
import { MetricsData } from '../types';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

export class MetricsCollector {
  private static metrics: MetricsData[] = [];
  
  static recordRequest(data: Omit<MetricsData, 'timestamp'>): void {
    const metric: MetricsData = {
      ...data,
      timestamp: new Date()
    };
    
    this.metrics.push(metric);
    
    // Log to console
    logger.info({
      type: 'request_metric',
      ...metric
    });
    
    // Keep only last 10000 metrics in memory
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(-10000);
    }
  }
  
  static getMetrics(): {
    avgResponseTime: number;
    cacheHitRate: number;
    totalRequests: number;
    errorRate: number;
  } {
    const total = this.metrics.length;
    
    if (total === 0) {
      return {
        avgResponseTime: 0,
        cacheHitRate: 0,
        totalRequests: 0,
        errorRate: 0
      };
    }
    
    const avgResponseTime = this.metrics.reduce((sum, m) => sum + m.responseTime, 0) / total;
    const cached = this.metrics.filter(m => m.cached).length;
    const errors = this.metrics.filter(m => m.statusCode >= 400).length;
    
    return {
      avgResponseTime: Math.round(avgResponseTime),
      cacheHitRate: Math.round((cached / total) * 100),
      totalRequests: total,
      errorRate: Math.round((errors / total) * 100 * 100) / 100
    };
  }
}