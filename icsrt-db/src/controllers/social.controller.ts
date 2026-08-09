import { Response } from 'express';
import SocialLinkModel from '../models/SocialLink.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getSocialLinks(req: AuthenticatedRequest, res: Response) {
  try {
    const links = await SocialLinkModel.findAll();
    return sendSuccess(res, 'Social links retrieved', { social_links: links, data: links });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getEnabledSocialLinks(req: AuthenticatedRequest, res: Response) {
  try {
    const links = await SocialLinkModel.findAll();
    const enabled = links.filter(l => l.enabled !== false);
    return sendSuccess(res, 'Enabled social links retrieved', { social_links: enabled, data: enabled });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateSocialLink(req: AuthenticatedRequest, res: Response) {
  try {
    const platform = req.params.platform as string;
    const updated = await SocialLinkModel.updatePlatform(platform, req.body);
    return sendSuccess(res, 'Social link updated', { link: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function saveAllSocialLinks(req: AuthenticatedRequest, res: Response) {
  try {
    const { social_links } = req.body;
    if (!Array.isArray(social_links)) {
      return sendError(res, 'social_links must be an array', 400);
    }
    const updatedLinks = await SocialLinkModel.saveAll(social_links);
    return sendSuccess(res, 'All social links updated successfully', { social_links: updatedLinks, data: updatedLinks });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
