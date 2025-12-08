import { Router } from 'express';
import { LinkPreviewController } from '../controllers/LinkPreviewController';
import { validate, linkPreviewSchema } from '../middleware/validationMiddleware';

const router = Router();
const linkPreviewController = new LinkPreviewController();

/**
 * @route POST /api/preview
 * @desc Generate a preview for a given URL
 * @access Public
 */
router.post('/preview', validate(linkPreviewSchema), (req, res) => linkPreviewController.generatePreview(req, res));

export default router;