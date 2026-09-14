import fs from 'fs';
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_URL } from '../config/env';
import logger from '../utils/logger';

let cloudinary: any = null;
try {
  cloudinary = require('cloudinary').v2;
} catch (e) {
  logger.warn('ℹ️ Cloudinary SDK module not loaded yet.');
}

// Configure Cloudinary if credentials exist
if (cloudinary && CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true
  });
  logger.info('☁️ Cloudinary SDK configured with API key credentials.');
} else if (cloudinary && CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: CLOUDINARY_URL,
    secure: true
  });
  logger.info('☁️ Cloudinary SDK configured via CLOUDINARY_URL.');
}

export interface CloudinaryUploadResult {
  url: string;
  secure_url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export async function uploadToCloudinary(filePath: string, folder = 'icsrt_uploads'): Promise<CloudinaryUploadResult | null> {
  const isCloudinaryConfigured = Boolean(
    cloudinary && ((CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) || CLOUDINARY_URL)
  );

  if (!isCloudinaryConfigured) {
    logger.info('ℹ️ Cloudinary credentials not configured; keeping local storage fallback.');
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: true
    });

    logger.success(`✅ File uploaded to Cloudinary: ${result.secure_url}`);
    
    // Clean up local temp file if it was saved locally by multer
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (e) {
      // Ignore local cleanup errors
    }

    return {
      url: result.url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error: any) {
    logger.error(`❌ Cloudinary upload failed: ${error.message}`);
    return null;
  }
}
