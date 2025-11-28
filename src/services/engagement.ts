import { pool } from '../config/database';
import { UserEngagementData } from '../types';

export class EngagementAnalyzer {
  static async analyze(userId: string): Promise<UserEngagementData> {
    const query = `
      SELECT 
        COUNT(CASE WHEN action='open' THEN 1 END) as opens,
        COUNT(CASE WHEN action='click' THEN 1 END) as clicks,
        AVG(time_spent) as avg_time_spent,
        mode() WITHIN GROUP (ORDER BY content_type) as preferred_type
      FROM user_engagement
      WHERE user_id = $1 
        AND created_at > NOW() - INTERVAL '30 days'
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // New user - return default profile
      return {
        userId,
        opens: 0,
        clicks: 0,
        avgTimeSpent: 0,
        preferredType: 'email',
        score: 50,
        profile: 'marketing_manager',
        preferredTone: 'professional'
      };
    }
    
    const data = result.rows[0];
    
    return {
      userId,
      opens: parseInt(data.opens),
      clicks: parseInt(data.clicks),
      avgTimeSpent: parseFloat(data.avg_time_spent) || 0,
      preferredType: data.preferred_type || 'email',
      score: this.calculateScore(data),
      profile: this.inferProfile(data),
      preferredTone: this.inferTone(data)
    };
  }
  
  private static calculateScore(data: any): number {
    // Score calculation: opens * 2 + clicks * 5 + time/60
    const score = (data.opens * 2) + (data.clicks * 5) + (data.avg_time_spent / 60);
    return Math.min(100, Math.round(score));
  }
  
  private static inferProfile(data: any): 'marketing_manager' | 'startup_founder' | 'content_creator' {
    // Simple heuristic - can be enhanced with ML
    const clickRate = data.clicks / (data.opens || 1);
    
    if (clickRate > 0.3 && data.avg_time_spent > 120) {
      return 'content_creator';
    } else if (clickRate > 0.2) {
      return 'startup_founder';
    } else {
      return 'marketing_manager';
    }
  }
  
  private static inferTone(data: any): string {
    const engagementLevel = data.opens + data.clicks;
    
    if (engagementLevel > 50) {
      return 'friendly and conversational';
    } else if (engagementLevel > 20) {
      return 'professional and informative';
    } else {
      return 'attention-grabbing and concise';
    }
  }
}