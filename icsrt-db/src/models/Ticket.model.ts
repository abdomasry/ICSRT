import { Collection, Document } from 'mongodb';
import { getDB } from '../config/db';
import { parseObjectId } from '../utils/helpers';
import { ITicket, ITicketMessage } from '../types';

export class TicketModel {
  static async getCollection(): Promise<Collection<Document>> {
    const db = await getDB();
    return db.collection('tickets');
  }

  static async create(ticketData: Partial<ITicket>): Promise<ITicket> {
    const collection = await this.getCollection();
    const newTicket = {
      ...ticketData,
      status: ticketData.status || 'open',
      messages: ticketData.messages || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const result = await collection.insertOne(newTicket);
    return { _id: result.insertedId, ...newTicket } as ITicket;
  }

  static async findById(id: any): Promise<ITicket | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    if (objectId) {
      const ticket = await collection.findOne({ _id: objectId });
      if (ticket) return ticket as ITicket;
    }
    return (await collection.findOne({ ticketId: id.toString() })) as ITicket | null;
  }

  static async find(query = {}): Promise<ITicket[]> {
    const collection = await this.getCollection();
    return (await collection.find(query).sort({ createdAt: -1 }).toArray()) as ITicket[];
  }

  static async updateById(id: any, updateData: Partial<ITicket>): Promise<ITicket | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    const filter = objectId ? { _id: objectId } : { ticketId: id.toString() };
    await collection.updateOne(filter, { $set: { ...updateData, updatedAt: new Date() } });
    return (await collection.findOne(filter)) as ITicket | null;
  }

  static async addMessage(id: any, messageObj: ITicketMessage): Promise<ITicket | null> {
    const objectId = parseObjectId(id);
    const collection = await this.getCollection();
    const filter = objectId ? { _id: objectId } : { ticketId: id.toString() };
    await collection.updateOne(filter, {
      $push: { messages: messageObj } as any,
      $set: { updatedAt: new Date() }
    });
    return (await collection.findOne(filter)) as ITicket | null;
  }

  static async count(query = {}): Promise<number> {
    const collection = await this.getCollection();
    return await collection.countDocuments(query);
  }
}

export default TicketModel;
