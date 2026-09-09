import express from 'express';
import * as socialController from '../controllers/social.controller';
import { requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/social-links', socialController.getSocialLinks);
router.get('/social-media', socialController.getSocialLinks);
router.get('/social', socialController.getSocialLinks);

router.get('/social-links/enabled', socialController.getEnabledSocialLinks);
router.get('/social-media/enabled', socialController.getEnabledSocialLinks);
router.get('/social/enabled', socialController.getEnabledSocialLinks);

router.post('/social-links', requireAdmin, socialController.saveAllSocialLinks);
router.post('/social-media', requireAdmin, socialController.saveAllSocialLinks);
router.post('/social', requireAdmin, socialController.saveAllSocialLinks);

router.put('/social-links/:platform', requireAdmin, socialController.updateSocialLink);
router.put('/social-media/:platform', requireAdmin, socialController.updateSocialLink);

router.put('/admin/social-links/:platform', requireAdmin, socialController.updateSocialLink);
router.post('/admin/social-links', requireAdmin, socialController.saveAllSocialLinks);
router.post('/admin/social-media', requireAdmin, socialController.saveAllSocialLinks);

export default router;
