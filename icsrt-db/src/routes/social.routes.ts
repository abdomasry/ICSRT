import express from 'express';
import * as socialController from '../controllers/social.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/social-links', socialController.getSocialLinks);
router.get('/social-links/enabled', socialController.getEnabledSocialLinks);
router.put('/admin/social-links/:platform', requireAdmin, socialController.updateSocialLink);
router.post('/admin/social-links', requireAdmin, socialController.saveAllSocialLinks);

export default router;
