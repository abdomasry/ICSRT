import { Response } from 'express';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError } from '../utils/errors';
import cacheService, { CACHE_TTL } from '../services/cache.service';

const publicCmsCollections = new Set([
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
]);

export const getCollectionItems = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const collectionName = req.params.collection as string;
  const isPublic = publicCmsCollections.has(collectionName);
  const cacheKey = `cms:collection:${collectionName}`;

  if (isPublic) {
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) {
      return sendSuccess(res, `${collectionName} items retrieved (cached)`, { [collectionName]: cached, data: cached });
    }
  }

  const db = await getDB();
  const col = db.collection(collectionName);
  const items = await col.find({}).toArray();

  if (isPublic) {
    await cacheService.set(cacheKey, items, CACHE_TTL.CMS_COLLECTION);
  }

  return sendSuccess(res, `${collectionName} items retrieved`, { [collectionName]: items, data: items });
});

export const getCollectionItemById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const collectionName = req.params.collection as string;
  const id = req.params.id as string;
  const isPublic = publicCmsCollections.has(collectionName);
  const cacheKey = `cms:item:${collectionName}:${id}`;

  if (isPublic) {
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      return sendSuccess(res, `${collectionName} item retrieved (cached)`, { item: cached, data: cached });
    }
  }

  const db = await getDB();
  const col = db.collection(collectionName);
  const objectId = parseObjectId(id);
  const filter = objectId ? { _id: objectId } : { id: id.toString() };
  const item = await col.findOne(filter);

  if (!item) {
    throw new NotFoundError(`${collectionName} item not found`);
  }

  if (isPublic) {
    await cacheService.set(cacheKey, item, CACHE_TTL.CMS_COLLECTION);
  }

  return sendSuccess(res, `${collectionName} item retrieved`, { item, data: item });
});

export const createCollectionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const collectionName = req.params.collection as string;
  const db = await getDB();
  const col = db.collection(collectionName);
  const newItem = {
    ...req.body,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  const result = await col.insertOne(newItem);
  const created = { _id: result.insertedId, ...newItem };

  // Invalidate CMS cache
  await cacheService.del(`cms:collection:${collectionName}`);

  return sendSuccess(res, `${collectionName} item created successfully`, { item: created, data: created }, 201);
});

export const updateCollectionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const collectionName = req.params.collection as string;
  const id = req.params.id as string;
  const db = await getDB();
  const col = db.collection(collectionName);
  const objectId = parseObjectId(id);
  const filter = objectId ? { _id: objectId } : { id: id.toString() };
  const updatePayload = {
    ...req.body,
    updatedAt: new Date()
  };
  delete updatePayload._id;

  await col.updateOne(filter, { $set: updatePayload });
  const updated = await col.findOne(filter);

  // Invalidate CMS cache
  await cacheService.del(`cms:collection:${collectionName}`);
  await cacheService.del(`cms:item:${collectionName}:${id}`);

  return sendSuccess(res, `${collectionName} item updated successfully`, { item: updated, data: updated });
});

export const deleteCollectionItem = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const collectionName = req.params.collection as string;
  const id = req.params.id as string;
  const db = await getDB();
  const col = db.collection(collectionName);
  const objectId = parseObjectId(id);
  const filter = objectId ? { _id: objectId } : { id: id.toString() };
  const result = await col.deleteOne(filter);
  if (result.deletedCount === 0) {
    throw new NotFoundError(`${collectionName} item not found`);
  }

  // Invalidate CMS cache
  await cacheService.del(`cms:collection:${collectionName}`);
  await cacheService.del(`cms:item:${collectionName}:${id}`);

  return sendSuccess(res, `${collectionName} item deleted successfully`);
});
