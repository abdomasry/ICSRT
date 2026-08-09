import { Response } from 'express';
import ArticleModel from '../models/Article.model';
import { sendSuccess, sendError } from '../utils/response';
import { parseObjectId } from '../utils/helpers';
import { getDB } from '../config/db';
import { AuthenticatedRequest } from '../types';

export async function getArticles(req: AuthenticatedRequest, res: Response) {
  try {
    const articles = await ArticleModel.find({});
    return sendSuccess(res, 'Articles retrieved', { articles, data: articles });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getArticleById(req: AuthenticatedRequest, res: Response) {
  try {
    const article = await ArticleModel.findById(req.params.id);
    if (!article) {
      return sendError(res, 'Article not found', 404);
    }
    return sendSuccess(res, 'Article details retrieved', { article, data: article });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, name, authors, abstract, content, category, journal, image, imageUrl } = req.body;
    if (!title && !name && !abstract) {
      return sendError(res, 'Title/name or abstract is required', 400);
    }

    const documentFile = req.file ? `/uploads/${req.file.filename}` : (req.body.documentUrl || null);

    const newArticle = await ArticleModel.create({
      title: title || name,
      name: name || title,
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

    return sendSuccess(res, 'Article published successfully', { article: newArticle, data: newArticle }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const updated = await ArticleModel.updateById(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'Article not found', 404);
    }
    return sendSuccess(res, 'Article updated successfully', { article: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteArticle(req: AuthenticatedRequest, res: Response) {
  try {
    const objectId = parseObjectId(req.params.id);
    const db = await getDB();
    const collection = db.collection('research_articles');
    const filter = objectId ? { _id: objectId } : { id: req.params.id.toString() };
    const resDel = await collection.deleteOne(filter);
    if (resDel.deletedCount === 0) {
      return sendError(res, 'Article not found', 404);
    }
    return sendSuccess(res, 'Article deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateArticleStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, reviewNotes } = req.body;
    const updated = await ArticleModel.updateById(req.params.id, {
      status,
      reviewNotes
    });
    if (!updated) {
      return sendError(res, 'Article not found', 404);
    }
    return sendSuccess(res, 'Article status updated', { article: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
