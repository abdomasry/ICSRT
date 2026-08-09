import { Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export function handleUpload(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.file && (!req.files || (req.files as any[]).length === 0)) {
      return sendError(res, 'No file uploaded', 400);
    }

    const uploadedFile = req.file || ((req.files as any[]) && (req.files as any[])[0]);
    const fileUrl = `/uploads/${uploadedFile.filename}`;

    return sendSuccess(res, 'File uploaded successfully', {
      url: fileUrl,
      imageUrl: fileUrl,
      fileUrl: fileUrl,
      filename: uploadedFile.filename,
      originalname: uploadedFile.originalname,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype
    }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
