import { createClient } from 'redis';

interface LinkPreview {
  url: string;
  title: string;
  description: string;
  image: string;
  siteName: string;
}

export class LinkPreviewService {
  private redisClient: ReturnType<typeof createClient>;
  private readonly CACHE_EXPIRY = 3600; // 1 hour in seconds

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.redisClient = createClient({ url: redisUrl });
    
    this.redisClient.connect().catch((err) => {
      console.error('Redis connection error:', err);
    });
  }

  /**
   * Fetch link preview data with caching
   * @param url The URL to generate preview for
   * @returns LinkPreview object
   */
  public async getLinkPreview(url: string): Promise<LinkPreview | null> {
    try {
      // Check cache first
      const cached = await this.getCachedPreview(url);
      if (cached) {
        return cached;
      }

      // Generate preview (stub implementation)
      const preview = await this.generatePreview(url);
      
      // Cache the result
      await this.cachePreview(url, preview);
      
      return preview;
    } catch (error) {
      console.error('Error generating link preview:', error);
      return null;
    }
  }

  /**
   * Get cached preview from Redis
   * @param url The URL to look up
   * @returns Cached LinkPreview or null
   */
  private async getCachedPreview(url: string): Promise<LinkPreview | null> {
    try {
      const key = `link_preview:${url}`;
      const cached = await this.redisClient.get(key);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching cached preview:', error);
      return null;
    }
  }

  /**
   * Cache preview in Redis
   * @param url The URL being cached
   * @param preview The preview data
   */
  private async cachePreview(url: string, preview: LinkPreview): Promise<void> {
    try {
      const key = `link_preview:${url}`;
      await this.redisClient.setEx(key, this.CACHE_EXPIRY, JSON.stringify(preview));
    } catch (error) {
      console.error('Error caching preview:', error);
    }
  }

  /**
   * Generate link preview (stub implementation)
   * @param url The URL to generate preview for
   * @returns LinkPreview object
   */
  private async generatePreview(url: string): Promise<LinkPreview> {
    // In a real implementation, you would fetch the URL and parse the HTML
    // For now, we'll return a stub response
    
    return {
      url,
      title: `Preview for ${url}`,
      description: `This is a preview of the content at ${url}`,
      image: '',
      siteName: new URL(url).hostname
    };
  }

  /**
   * Close Redis connection
   */
  public async close(): Promise<void> {
    await this.redisClient.quit();
  }
}