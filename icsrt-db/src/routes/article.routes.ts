import express from 'express';
import * as articleController from '../controllers/article.controller';
import upload from '../middleware/upload.middleware';
import { optionalAuth, requireAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/articles', articleController.getArticles);
router.get('/articles/:id', articleController.getArticleById);
router.post('/articles', optionalAuth, upload.single('document'), articleController.createArticle);
router.put('/articles/:id', requireAdmin, articleController.updateArticle);
router.delete('/articles/:id', requireAdmin, articleController.deleteArticle);

router.get('/news', articleController.getArticles);
router.get('/news/:id', articleController.getArticleById);
router.post('/news', optionalAuth, upload.single('document'), articleController.createArticle);
router.put('/news/:id', requireAdmin, articleController.updateArticle);
router.delete('/news/:id', requireAdmin, articleController.deleteArticle);

router.get('/papers', articleController.getArticles);
router.get('/papers/:id', articleController.getArticleById);
router.post('/papers', optionalAuth, upload.single('document'), articleController.createArticle);
router.put('/papers/:id', requireAdmin, articleController.updateArticle);
router.delete('/papers/:id', requireAdmin, articleController.deleteArticle);

router.put('/admin/articles/:id/status', requireAdmin, articleController.updateArticleStatus);

export default router;
