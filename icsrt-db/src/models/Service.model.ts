import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { IService, IServiceOrder } from '../types';

export class ServiceModel {
  static async getServicesCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('services');
  }

  static async getOrdersCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('service_orders');
  }

  static async findAllServices(query = {}): Promise<IService[]> {
    const collection = await this.getServicesCollection();
    return (await collection.find(query).toArray()) as IService[];
  }

  static async findServiceById(id: any): Promise<IService | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getServicesCollection();
    if (objectId) {
      const res = await collection.findOne({ _id: objectId });
      if (res) return res as IService;
    }
    return (await collection.findOne({ id: id.toString() })) as IService | null;
  }

  static async createService(serviceData: Partial<IService>): Promise<IService> {
    const collection = await this.getServicesCollection();
    const newService = {
      ...serviceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await collection.insertOne(newService);
    return { _id: res.insertedId, ...newService } as IService;
  }

  static async updateServiceById(id: any, updateData: Partial<IService>): Promise<IService | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getServicesCollection();
    const filter = objectId ? { _id: objectId } : { id: id.toString() };
    await collection.updateOne(filter, { $set: { ...updateData, updatedAt: new Date() } });
    return (await collection.findOne(filter)) as IService | null;
  }

  static async deleteServiceById(id: any): Promise<boolean> {
    const objectId = parseObjectId(id);
    const collection = await this.getServicesCollection();
    const filter = objectId ? { _id: objectId } : { id: id.toString() };
    const res = await collection.deleteOne(filter);
    return res.deletedCount > 0;
  }

  static async createOrder(orderData: Partial<IServiceOrder>): Promise<IServiceOrder> {
    const collection = await this.getOrdersCollection();
    const newOrder = {
      ...orderData,
      status: orderData.status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newOrder);
    return { _id: result.insertedId, ...newOrder } as IServiceOrder;
  }

  static async findOrderById(id: any): Promise<IServiceOrder | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getOrdersCollection();
    if (objectId) {
      const res = await collection.findOne({ _id: objectId });
      if (res) return res as IServiceOrder;
    }
    return (await collection.findOne({ orderNumber: id.toString() })) as IServiceOrder | null;
  }

  static async findOrders(query = {}): Promise<IServiceOrder[]> {
    const collection = await this.getOrdersCollection();
    return (await collection.find(query).sort({ createdAt: -1 }).toArray()) as IServiceOrder[];
  }

  static async updateOrderById(id: any, updateData: Partial<IServiceOrder>): Promise<IServiceOrder | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getOrdersCollection();
    const filter = objectId ? { _id: objectId } : { orderNumber: id.toString() };
    const updatePayload = {
      ...updateData,
      updatedAt: new Date()
    };
    await collection.updateOne(filter, { $set: updatePayload });
    return (await collection.findOne(filter)) as IServiceOrder | null;
  }

  static async countOrders(query = {}): Promise<number> {
    const collection = await this.getOrdersCollection();
    return await collection.countDocuments(query);
  }
}

export default ServiceModel;
