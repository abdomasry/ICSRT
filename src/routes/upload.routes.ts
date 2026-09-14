import express from 'express';
import * as uploadController from '../controllers/upload.controller';
import upload from '../middleware/upload.middleware';

const router = express.Router();

router.post('/upload', upload.single('file'), uploadController.handleUpload);

export default router;
