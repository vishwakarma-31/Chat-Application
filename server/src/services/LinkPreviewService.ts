import { createClient } from 'redis';
import * as cheerio from 'cheerio';
import config from '../config';

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
    this.redisClient = createClient({ url: config.redisUrl });
    
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

      // Generate preview
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
   * Generate link preview by scraping the URL
   * @param url The URL to generate preview for
   * @returns LinkPreview object
   */
  private async generatePreview(url: string): Promise<LinkPreview> {
    try {
      // Fetch the URL content
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; LinkPreviewBot/1.0)'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract metadata
      const title = this.extractTitle($, url);
      const description = this.extractDescription($);
      const image = this.extractImage($, url);
      const siteName = this.extractSiteName($, url);
      
      return {
        url,
        title,
        description,
        image,
        siteName
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      // Fallback to basic preview if scraping fails
      return {
        url,
        title: `Preview for ${new URL(url).hostname}`,
        description: `Unable to fetch detailed preview for ${url}`,
        image: '',
        siteName: new URL(url).hostname
      };
    }
  }
  
  /**
   * Extract title from HTML
   */
  private extractTitle($: cheerio.CheerioAPI, url: string): string {
    // Try og:title first
    let title = $('meta[property="og:title"]').attr('content') ||
                $('meta[name="twitter:title"]').attr('content') ||
                $('title').text();
                
    // Fallback to hostname if no title found
    return title ? title.trim() : new URL(url).hostname;
  }
  
  /**
   * Extract description from HTML
   */
  private extractDescription($: cheerio.CheerioAPI): string {
    // Try og:description first
    let description = $('meta[property="og:description"]').attr('content') ||
                      $('meta[name="twitter:description"]').attr('content') ||
                      $('meta[name="description"]').attr('content');
                      
    return description ? description.trim() : '';
  }
  
  /**
   * Extract image from HTML
   */
  private extractImage($: cheerio.CheerioAPI, url: string): string {
    // Try og:image first
    let image = $('meta[property="og:image"]').attr('content') ||
                $('meta[name="twitter:image"]').attr('content') ||
                $('link[rel="image_src"]').attr('href');
                
    // Convert relative URLs to absolute URLs
    if (image && !image.startsWith('http')) {
      try {
        const baseUrl = new URL(url);
        image = new URL(image, baseUrl).href;
      } catch (e) {
        // If we can't resolve the relative URL, return empty
        image = '';
      }
    }
    
    return image || '';
  }
  
  /**
   * Extract site name from HTML
   */
  private extractSiteName($: cheerio.CheerioAPI, url: string): string {
    // Try og:site_name first
    let siteName = $('meta[property="og:site_name"]').attr('content') ||
                   $('meta[name="application-name"]').attr('content');
                   
    // Fallback to hostname
    return siteName ? siteName.trim() : new URL(url).hostname;
  }

  /**
   * Close Redis connection
   */
  public async close(): Promise<void> {
    await this.redisClient.quit();
  }
}