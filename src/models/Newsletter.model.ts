import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';

export interface INewsletterSubscriber {
  _id?: any;
  id?: string;
  email: string;
  name?: string;
  status: 'active' | 'unsubscribed';
  subscribedAt: Date;
  updatedAt: Date;
}

class NewsletterModel {
  private collectionName = 'newsletter_subscribers';

  private async getCollection() {
    const db = await getDB();
    return db.collection<INewsletterSubscriber>(this.collectionName);
  }

  async subscribe(email: string, name?: string): Promise<INewsletterSubscriber> {
    const col = await this.getCollection();
    const existing = await col.findOne({ email: email.toLowerCase() });
    const now = new Date();
    if (existing) {
      await col.updateOne({ _id: existing._id }, { $set: { status: 'active', updatedAt: now } });
      return { ...existing, status: 'active', updatedAt: now };
    }
    const doc: INewsletterSubscriber = {
      email: email.toLowerCase(),
      name: name || '',
      status: 'active',
      subscribedAt: now,
      updatedAt: now
    };
    const res = await col.insertOne(doc);
    return { ...doc, _id: res.insertedId, id: res.insertedId.toString() };
  }

  async findAll(statusFilter = 'all', page = 1, limit = 20, search = ''): Promise<{ subscribers: INewsletterSubscriber[]; total: number }> {
    const col = await this.getCollection();
    const query: any = {};
    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }
    if (search) {
      query.email = { $regex: search, $options: 'i' };
    }
    const total = await col.countDocuments(query);
    const skip = (page - 1) * limit;
    const subscribers = await col.find(query).sort({ subscribedAt: -1 }).skip(skip).limit(limit).toArray();
    return { subscribers, total };
  }

  async unsubscribe(email: string): Promise<boolean> {
    const col = await this.getCollection();
    const res = await col.updateOne({ email: email.toLowerCase() }, { $set: { status: 'unsubscribed', updatedAt: new Date() } });
    return res.modifiedCount > 0;
  }

  async deleteById(id: string): Promise<boolean> {
    const col = await this.getCollection();
    const objId = parseObjectId(id);
    const filter = objId ? { _id: objId } : { id };
    const res = await col.deleteOne(filter);
    return res.deletedCount > 0;
  }
}

export default new NewsletterModel();
