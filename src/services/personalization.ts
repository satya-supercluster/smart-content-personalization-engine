import OpenAI from 'openai';
import { PersonalizationResponse, UserEngagementData } from '../types';

export class PersonalizationService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  static async generate(params: {
    userId: string;
    engagement: UserEngagementData;
    contentType: string;
    template: string;
    subject?: string;
  }): Promise<PersonalizationResponse> {
    const prompt = this.buildPrompt(params);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert email marketing copywriter. Create personalized, engaging content that drives action."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const content = completion.choices[0].message.content || '';
      
      return {
        content,
        subject: params.subject,
        engagementScore: params.engagement.score,
        tokensUsed: completion.usage?.total_tokens || 0,
        cached: false,
        personalizationFactors: this.getPersonalizationFactors(params.engagement)
      };
    } catch (error: any) {
      throw new Error(`GPT API error: ${error.message}`);
    }
  }
  
  private static buildPrompt(params: any): string {
    const { engagement, template, contentType } = params;
    
    return `Create a personalized ${contentType} for a user with this profile:

Profile Type: ${engagement.profile}
Engagement Score: ${engagement.score}/100
Email Opens (30 days): ${engagement.opens}
Clicks (30 days): ${engagement.clicks}
Average Time Spent: ${engagement.avgTimeSpent}s
Preferred Tone: ${engagement.preferredTone}

Template: ${template}

Guidelines:
- Match the preferred tone: ${engagement.preferredTone}
- Keep it concise and action-oriented
- Include a clear call-to-action
- Personalize based on their engagement level
${engagement.score > 70 ? '- This is a highly engaged user, be more personal' : '- This user needs re-engagement, be more compelling'}

Generate only the email body, no subject line.`;
  }
  
  private static getPersonalizationFactors(engagement: UserEngagementData): string[] {
    const factors: string[] = [];
    
    factors.push(`Profile: ${engagement.profile}`);
    
    if (engagement.opens > 10) {
      factors.push('High email engagement');
    }
    
    if (engagement.clicks > 5) {
      factors.push('Active clicker');
    }
    
    if (engagement.avgTimeSpent > 60) {
      factors.push('Deep reader');
    }
    
    factors.push(`Tone: ${engagement.preferredTone}`);
    
    return factors;
  }
}