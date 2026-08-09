import express from 'express';
import * as cmsController from '../controllers/cms.controller';
import { requireAdmin, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

const cmsCollections = [
  'about',
  'events',
  'faq',
  'speakers',
  'testimonials',
  'gallery',
  'conferences',
  'journals',
  'registrations',
  'admins',
  'roles',
  'collaborations',
  'newsletter',
  'vision',
  'mission'
];

cmsCollections.forEach(col => {
  router.get(`/${col}`, optionalAuth, (req, res, next) => {
    req.params.collection = col;
    cmsController.getCollectionItems(req, res);
  });

  router.get(`/${col}/:id`, optionalAuth, (req, res, next) => {
    req.params.collection = col;
    cmsController.getCollectionItemById(req, res);
  });

  router.post(`/${col}`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    cmsController.createCollectionItem(req, res);
  });

  router.put(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    cmsController.updateCollectionItem(req, res);
  });

  router.delete(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    cmsController.deleteCollectionItem(req, res);
  });
});

export default router;
