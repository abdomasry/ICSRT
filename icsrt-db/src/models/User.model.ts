import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { IUser } from '../types';

export class UserModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('users');
  }

  static async findById(id: any): Promise<IUser | null> {
    const objectId = parseObjectId(id);
    if (!objectId) return null;
    const collection = await this.getCollection();
    return (await collection.findOne({ _id: objectId })) as IUser | null;
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    if (!email) return null;
    const collection = await this.getCollection();
    return (await collection.findOne({ email: email.toLowerCase().trim() })) as IUser | null;
  }

  static async findByVerificationToken(token: string): Promise<IUser | null> {
    const collection = await this.getCollection();
    return (await collection.findOne({ verificationToken: token })) as IUser | null;
  }

  static async findByResetToken(token: string): Promise<IUser | null> {
    const collection = await this.getCollection();
    return (await collection.findOne({ 
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    })) as IUser | null;
  }

  static async create(userData: Partial<IUser>): Promise<IUser> {
    const collection = await this.getCollection();
    const newUser = {
      ...userData,
      email: (userData.email || '').toLowerCase().trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newUser);
    return { _id: result.insertedId, ...newUser } as IUser;
  }

  static async updateById(id: any, updateData: Partial<IUser>): Promise<IUser | null> {
    const objectId = parseObjectId(id);
    if (!objectId) return null;
    const collection = await this.getCollection();
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };
    await collection.updateOne({ _id: objectId }, { $set: updatePayload });
    return await this.findById(objectId);
  }

  static async deleteById(id: any): Promise<boolean> {
    const objectId = parseObjectId(id);
    if (!objectId) return false;
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: objectId });
    return result.deletedCount > 0;
  }

  static async findAll(query = {}, projection = {}): Promise<IUser[]> {
    const collection = await this.getCollection();
    return (await collection.find(query, { projection }).toArray()) as IUser[];
  }

  static async count(query = {}): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments(query);
  }
}

export default UserModel;
