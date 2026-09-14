import express from 'express';
import * as cmsController from '../controllers/cms.controller';
import { requireAdmin, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

const publicCmsCollections = [
  'about',
  'events',
  'faq',
  'speakers',
  'testimonials',
  'gallery',
  'conferences',
  'journals',
  'collaborations',
  'vision',
  'mission'
];

const adminCmsCollections = [
  'admins',
  'roles',
  'registrations'
];

// Publicly readable CMS collections (admin write)
publicCmsCollections.forEach(col => {
  router.get(`/${col}`, optionalAuth, (req, res, next) => {
    req.params.collection = col;
    return cmsController.getCollectionItems(req, res, next);
  });

  router.get(`/${col}/:id`, optionalAuth, (req, res, next) => {
    req.params.collection = col;
    return cmsController.getCollectionItemById(req, res, next);
  });

  router.post(`/${col}`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.createCollectionItem(req, res, next);
  });

  router.put(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.updateCollectionItem(req, res, next);
  });

  router.delete(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.deleteCollectionItem(req, res, next);
  });
});

// Admin-only CMS collections (admin read & write)
adminCmsCollections.forEach(col => {
  router.get(`/${col}`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.getCollectionItems(req, res, next);
  });

  router.get(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.getCollectionItemById(req, res, next);
  });

  router.post(`/${col}`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.createCollectionItem(req, res, next);
  });

  router.put(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.updateCollectionItem(req, res, next);
  });

  router.delete(`/${col}/:id`, requireAdmin, (req, res, next) => {
    req.params.collection = col;
    return cmsController.deleteCollectionItem(req, res, next);
  });
});

export default router;
