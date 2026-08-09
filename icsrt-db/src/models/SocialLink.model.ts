import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { ISocialLink } from '../types';

export class SocialLinkModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('social_links');
  }

  static async findAll(): Promise<ISocialLink[]> {
    const collection = await this.getCollection();
    return (await collection.find({}).sort({ order: 1, platform: 1 }).toArray()) as ISocialLink[];
  }

  static async updatePlatform(platform: string, data: Partial<ISocialLink>): Promise<ISocialLink | null> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { platform: platform.toLowerCase() },
      { $set: { ...data, updatedAt: new Date() } },
      { upsert: true }
    );
    return (await collection.findOne({ platform: platform.toLowerCase() })) as ISocialLink | null;
  }

  static async saveAll(links: ISocialLink[]): Promise<ISocialLink[]> {
    const collection = await this.getCollection();
    for (const link of links) {
      if (link.platform) {
        await collection.updateOne(
          { platform: link.platform.toLowerCase() },
          { $set: { ...link, updatedAt: new Date() } },
          { upsert: true }
        );
      }
    }
    return await this.findAll();
  }
}

export default SocialLinkModel;
