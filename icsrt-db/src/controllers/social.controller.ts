import { Response } from 'express';
import SocialLinkModel from '../models/SocialLink.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export const getSocialLinks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const links = await SocialLinkModel.findAll();
  return sendSuccess(res, 'Social links retrieved', { social_links: links, data: links });
});

export const getEnabledSocialLinks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const links = await SocialLinkModel.findAll();
  const enabled = links.filter(l => l.enabled !== false);
  return sendSuccess(res, 'Enabled social links retrieved', { social_links: enabled, data: enabled });
});

export const updateSocialLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const platform = req.params.platform as string;
  const updated = await SocialLinkModel.updatePlatform(platform, req.body);
  return sendSuccess(res, 'Social link updated', { link: updated, data: updated });
});

export const saveAllSocialLinks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { social_links, platform, url, icon, enabled } = req.body;
  if (Array.isArray(social_links)) {
    const updatedLinks = await SocialLinkModel.saveAll(social_links);
    return sendSuccess(res, 'All social links updated successfully', { social_links: updatedLinks, data: updatedLinks });
  }
  if (platform || url) {
    const platName = platform || 'social';
    const updated = await SocialLinkModel.updatePlatform(platName, req.body);
    return sendSuccess(res, 'Social link updated successfully', { link: updated, data: updated }, 201);
  }
  throw new BadRequestError('social_links array or platform details required');
});
