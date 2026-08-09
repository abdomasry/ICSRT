import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { IArticle } from '../types';

export class ArticleModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('research_articles');
  }

  static async find(query = {}): Promise<IArticle[]> {
    const collection = await this.getCollection();
    return (await collection.find(query).sort({ createdAt: -1 }).toArray()) as IArticle[];
  }

  static async findById(id: any): Promise<IArticle | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    if (objectId) {
      return (await collection.findOne({ _id: objectId })) as IArticle | null;
    }
    return (await collection.findOne({ id: id.toString() })) as IArticle | null;
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
