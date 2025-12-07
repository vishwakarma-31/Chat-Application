import { Request, Response } from 'express';
import { LinkPreviewService } from '../services/LinkPreviewService';

export class LinkPreviewController {
  private linkPreviewService: LinkPreviewService;

  constructor() {
    this.linkPreviewService = new LinkPreviewService();
  }

  /**
   * POST /preview endpoint
   * Generates a preview for a given URL
   */
  public async generatePreview(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ error: 'URL is required' });
        return;
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (err) {
        res.status(400).json({ error: 'Invalid URL format' });
        return;
      }

      const preview = await this.linkPreviewService.getLinkPreview(url);

      if (!preview) {
        res.status(500).json({ error: 'Failed to generate preview' });
        return;
      }

      res.json(preview);
    } catch (error) {
      console.error('Error in generatePreview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}