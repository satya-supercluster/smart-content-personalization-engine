import { createClient } from 'redis';

export class CacheService {
  private static client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  private static isConnected = false;
  
  static async connect() {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
      console.log('✓ Redis connected');
    }
  }
  
  static async get(key: string): Promise<string | null> {
    await this.connect();
    return await this.client.get(key);
  }
  
  static async set(key: string, value: string, ttl: number = 3600): Promise<void> {
    await this.connect();
    await this.client.setEx(key, ttl, value);
  }
  
  static async delete(key: string): Promise<void> {
    await this.connect();
    await this.client.del(key);
  }
  
  static async flush(): Promise<void> {
    await this.connect();
    await this.client.flushAll();
  }
}