import { Response } from 'express';
import ArticleModel from '../models/Article.model';
import { sendSuccess } from '../utils/response';
import { parseObjectId } from '../utils/helpers';
import { getDB } from '../config/db';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/errors';
import cacheService, { CACHE_TTL } from '../services/cache.service';

export const getArticles = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query: Record<string, any> = {};
  if (req.query.status) {
    query.status = req.query.status;
  }
  if (req.query.category) {
    query.category = req.query.category;
  }

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : (req.query.page ? (parseInt(req.query.page as string, 10) - 1) * (limit || 20) : undefined);

  const cacheKey = `public:articles:list:${req.query.status || 'all'}:${req.query.category || 'all'}:${limit || 'default'}:${skip || 0}`;
  const cached = await cacheService.get<any[]>(cacheKey);
  if (cached) {
    return sendSuccess(res, 'Articles retrieved successfully (cached)', { articles: cached, data: cached, count: cached.length });
  }

  const articles = await ArticleModel.find(query, { limit, skip });
  await cacheService.set(cacheKey, articles, CACHE_TTL.ARTICLES);

  return sendSuccess(res, 'Articles retrieved successfully', { articles, data: articles, count: articles.length });
});

export const getArticleById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const cacheKey = `public:articles:item:${req.params.id}`;
  const cached = await cacheService.get<any>(cacheKey);
  if (cached) {
    return sendSuccess(res, 'Article details retrieved (cached)', { article: cached, data: cached });
  }

  const article = await ArticleModel.findById(req.params.id);
  if (!article) {
    throw new NotFoundError('Article not found');
  }

  await cacheService.set(cacheKey, article, CACHE_TTL.ARTICLES);

  return sendSuccess(res, 'Article details retrieved', { article, data: article });
});

export const createArticle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, name, authors, abstract, content, category, journal, image, imageUrl } = req.body;
  const documentFile = req.file ? `/uploads/${req.file.filename}` : (req.body.documentUrl || null);

  const articleTitle = title || name || 'Untitled Article';

  const newArticle = await ArticleModel.create({
    title: articleTitle,
    name: name || articleTitle,
    authors: authors || req.user?.name || 'Author',
    abstract: abstract || content || '',
    content: content || abstract || '',
    category: category || 'General',
    journal: journal || 'ICSRT Journal',
    submittedBy: req.user?.email || 'Anonymous',
    documentUrl: documentFile,
    image: image || imageUrl || '',
    imageUrl: imageUrl || image || '',
    status: 'published'
  });

  // Invalidate articles cache
  await cacheService.delByPattern('public:articles:*');

  return sendSuccess(res, 'Article published successfully', { article: newArticle, data: newArticle }, 201);
});

export const updateArticle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updated = await ArticleModel.updateById(req.params.id, req.body);
  if (!updated) {
    throw new NotFoundError('Article not found');
  }

  // Invalidate articles cache
  await cacheService.delByPattern('public:articles:*');

  return sendSuccess(res, 'Article updated successfully', { article: updated, data: updated });
});

export const deleteArticle = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const objectId = parseObjectId(req.params.id);
  const db = await getDB();
  const collection = db.collection('research_articles');
  const filter = objectId ? { _id: objectId } : { id: req.params.id.toString() };
  const resDel = await collection.deleteOne(filter);
  if (resDel.deletedCount === 0) {
    throw new NotFoundError('Article not found');
  }

  // Invalidate articles cache
  await cacheService.delByPattern('public:articles:*');

  return sendSuccess(res, 'Article deleted successfully');
});

export const updateArticleStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, reviewNotes } = req.body;
  const updated = await ArticleModel.updateById(req.params.id, {
    status,
    reviewNotes
  });
  if (!updated) {
    throw new NotFoundError('Article not found');
  }

  // Invalidate articles cache
  await cacheService.delByPattern('public:articles:*');

  return sendSuccess(res, 'Article status updated', { article: updated, data: updated });
});
