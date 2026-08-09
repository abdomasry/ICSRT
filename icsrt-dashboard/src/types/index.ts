export interface AdminUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  country?: string;
  role?: string;
  isVerified?: boolean;
}

export interface Service {
  _id?: string;
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
}

export interface ServiceOrder {
  _id?: string;
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
  customerInfo?: any;
  createdAt?: string;
}

export interface TicketMessage {
  sender: string;
  senderRole?: string;
  text: string;
  createdAt?: string;
}

export interface Ticket {
  _id?: string;
  ticketId: string;
  userEmail: string;
  userName?: string;
  subject: string;
  category?: string;
  priority?: string;
  status: string;
  messages: TicketMessage[];
  createdAt?: string;
}

export interface Coupon {
  _id?: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  expiryDate?: string | null;
  minPurchaseAmount?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ContactRequest {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface SocialLink {
  _id?: string;
  platform: string;
  url: string;
  icon?: string;
  label?: string;
  enabled?: boolean;
}

export interface DashboardStats {
  totalUsers?: number;
  totalOrders?: number;
  pendingOrders?: number;
  totalTickets?: number;
  openTickets?: number;
}
