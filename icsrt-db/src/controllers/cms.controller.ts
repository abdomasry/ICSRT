import { Response } from 'express';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getCollectionItems(req: AuthenticatedRequest, res: Response) {
  try {
    const collectionName = req.params.collection as string;
    const db = await getDB();
    const col = db.collection(collectionName);
    const items = await col.find({}).toArray();
    return sendSuccess(res, `${collectionName} items retrieved`, { [collectionName]: items, data: items });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getCollectionItemById(req: AuthenticatedRequest, res: Response) {
  try {
    const collectionName = req.params.collection as string;
    const id = req.params.id as string;
    const db = await getDB();
    const col = db.collection(collectionName);
    const objectId = parseObjectId(id);
    const filter = objectId ? { _id: objectId } : { id: id.toString() };
    const item = await col.findOne(filter);
    if (!item) {
      return sendError(res, `${collectionName} item not found`, 404);
    }
    return sendSuccess(res, `${collectionName} item retrieved`, { item, data: item });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createCollectionItem(req: AuthenticatedRequest, res: Response) {
  try {
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
    return sendSuccess(res, `${collectionName} item created successfully`, { item: created, data: created }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateCollectionItem(req: AuthenticatedRequest, res: Response) {
  try {
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
    return sendSuccess(res, `${collectionName} item updated successfully`, { item: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteCollectionItem(req: AuthenticatedRequest, res: Response) {
  try {
    const collectionName = req.params.collection as string;
    const id = req.params.id as string;
    const db = await getDB();
    const col = db.collection(collectionName);
    const objectId = parseObjectId(id);
    const filter = objectId ? { _id: objectId } : { id: id.toString() };
    const result = await col.deleteOne(filter);
    if (result.deletedCount === 0) {
      return sendError(res, `${collectionName} item not found`, 404);
    }
    return sendSuccess(res, `${collectionName} item deleted successfully`);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
