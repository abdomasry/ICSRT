import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { IContact } from '../types';

export class ContactModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('contacts');
  }

  static async create(contactData: Partial<IContact>): Promise<IContact> {
    const collection = await this.getCollection();
    const newContact = {
      ...contactData,
      status: contactData.status || 'new',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await collection.insertOne(newContact);
    return { _id: res.insertedId, ...newContact } as IContact;
  }

  static async findAll(query = {}, options: { limit?: number; skip?: number } = {}): Promise<IContact[]> {
    const collection = await this.getCollection();
    let cursor = collection.find(query).sort({ createdAt: -1 });
    if (options.skip && options.skip > 0) {
      cursor = cursor.skip(options.skip);
    }
    if (options.limit && options.limit > 0) {
      cursor = cursor.limit(options.limit);
    }
    return (await cursor.toArray()) as IContact[];
  }

  static async findById(id: any): Promise<IContact | null> {
    const objectId = parseObjectId(id);
    if (!objectId) return null;
    const collection = await this.getCollection();
    return (await collection.findOne({ _id: objectId })) as IContact | null;
  }

  static async updateStatus(id: any, status: string): Promise<IContact | null> {
    const objectId = parseObjectId(id);
    if (!objectId) return null;
    const collection = await this.getCollection();
    await collection.updateOne(
      { _id: objectId },
      { $set: { status, updatedAt: new Date() } }
    );
    return await this.findById(objectId);
  }
}

export default ContactModel;
