import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { IArticle } from '../types';

export class ArticleModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('research_articles');
  }

  static async find(query = {}, options: { limit?: number; skip?: number } = {}): Promise<IArticle[]> {
    const collection = await this.getCollection();
    let cursor = collection.find(query).sort({ createdAt: -1 });
    if (options.skip && options.skip > 0) {
      cursor = cursor.skip(options.skip);
    }
    if (options.limit && options.limit > 0) {
      cursor = cursor.limit(options.limit);
    }
    return (await cursor.toArray()) as IArticle[];
  }

  static async findById(id: any): Promise<IArticle | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    if (objectId) {
      const found = await collection.findOne({ _id: objectId });
      if (found) return found as IArticle;
    }
    const strId = String(id || '');
    return (await collection.findOne({
      $or: [{ id: strId }, { slug: strId }, { _id: strId as any }]
    })) as IArticle | null;
  }

  static async create(articleData: Partial<IArticle>): Promise<IArticle> {
    const collection = await this.getCollection();
    const newArticle = {
      ...articleData,
      status: articleData.status || 'submitted',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await collection.insertOne(newArticle);
    return { _id: res.insertedId, ...newArticle } as IArticle;
  }

  static async updateById(id: any, updateData: Partial<IArticle>): Promise<IArticle | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    const filter = objectId ? { _id: objectId } : { id: id.toString() };
    await collection.updateOne(filter, { $set: { ...updateData, updatedAt: new Date() } });
    return (await collection.findOne(filter)) as IArticle | null;
  }
}

export default ArticleModel;
