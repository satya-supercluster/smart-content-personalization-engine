export interface UserEngagementData {
  userId: string;
  opens: number;
  clicks: number;
  avgTimeSpent: number;
  preferredType: string;
  score: number;
  profile: 'marketing_manager' | 'startup_founder' | 'content_creator';
  preferredTone: string;
}

export interface PersonalizationRequest {
  userId: string;
  contentType: 'email' | 'push_notification' | 'sms';
  template: string;
  subject?: string;
}

export interface PersonalizationResponse {
  content: string;
  subject?: string;
  engagementScore: number;
  tokensUsed: number;
  cached: boolean;
  personalizationFactors: string[];
}

export interface MetricsData {
  timestamp: Date;
  endpoint: string;
  responseTime: number;
  statusCode: number;
  userId?: string;
  cached: boolean;
}