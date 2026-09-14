import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { ICoupon } from '../types';

export class CouponModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('coupons');
  }

  static async findByCode(code: string): Promise<ICoupon | null> {
    if (!code) return null;
    const collection = await this.getCollection();
    return (await collection.findOne({ code: code.toUpperCase().trim() })) as ICoupon | null;
  }

  static async create(couponData: Partial<ICoupon>): Promise<ICoupon> {
    const collection = await this.getCollection();
    const newCoupon = {
      ...couponData,
      code: (couponData.code || '').toUpperCase().trim(),
      isActive: couponData.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newCoupon);
    return { _id: result.insertedId, ...newCoupon } as ICoupon;
  }

  static async findAll(): Promise<ICoupon[]> {
    const collection = await this.getCollection();
    return (await collection.find({}).sort({ createdAt: -1 }).toArray()) as ICoupon[];
  }

  static async updateStatus(code: string, isActive: boolean): Promise<ICoupon | null> {
    const collection = await this.getCollection();
    await collection.updateOne(
      { code: code.toUpperCase().trim() },
      { $set: { isActive, updatedAt: new Date() } }
    );
    return await this.findByCode(code);
  }

  static async deleteByCode(code: string): Promise<boolean> {
    const collection = await this.getCollection();
    const res = await collection.deleteOne({ code: code.toUpperCase().trim() });
    return res.deletedCount > 0;
  }
}

export default CouponModel;
