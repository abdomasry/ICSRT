import { Request } from 'express';
import { ObjectId } from 'mongodb';

export interface IUser {
  _id?: ObjectId;
  id?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  organization?: string;
  country?: string;
  role: 'user' | 'admin' | 'super_admin';
  isVerified?: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IService {
  _id?: ObjectId;
  id?: string;
  title: string;
  name?: string;
  description: string;
  price: number;
  category?: string;
  icon?: string;
  image?: string;
  imageUrl?: string;
  features?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IServiceOrder {
  _id?: ObjectId;
  orderNumber: string;
  userEmail: string;
  serviceId?: string;
  serviceName?: string;
  serviceTitle?: string;
  price?: number;
  currency?: string;
  status: string;
  pricingStatus?: string;
  adminNotes?: string;
  pricingNotes?: string;
  purchaseToken?: string;
  purchaseLink?: string;
  purchaseTokenExpires?: Date;
  customerInfo?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITicketMessage {
  sender: string;
  senderRole: string;
  text: string;
  createdAt: Date;
}

export interface ITicket {
  _id?: ObjectId;
  ticketId: string;
  userEmail: string;
  userName?: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  messages: ITicketMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICoupon {
  _id?: ObjectId;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: Date | null;
  minPurchaseAmount?: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IArticle {
  _id?: ObjectId;
  id?: string;
  title: string;
  name?: string;
  authors?: string;
  abstract: string;
  content?: string;
  category?: string;
  journal?: string;
  submittedBy?: string;
  documentUrl?: string | null;
  image?: string;
  imageUrl?: string;
  status: string;
  reviewNotes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISocialLink {
  _id?: ObjectId;
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  enabled?: boolean;
  order?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IContact {
  _id?: ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  isRead?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthUserPayload {
  userId: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'super_admin';
}

export type AuthenticatedRequest = Request & {
  user?: AuthUserPayload;
  admin?: AuthUserPayload;
  file?: any;
  files?: any;
};
