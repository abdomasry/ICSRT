import { Response } from 'express';
import ServiceModel from '../models/Service.model';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';
import { generateToken } from '../utils/helpers';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import cacheService, { CACHE_TTL } from '../services/cache.service';

const SERVICES_CACHE_KEY = 'public:services:list';

export const getServices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const cached = await cacheService.get<any[]>(SERVICES_CACHE_KEY);
  if (cached) {
    return sendSuccess(res, 'Services retrieved successfully (cached)', { services: cached, data: cached });
  }

  const services = await ServiceModel.findAllServices();
  await cacheService.set(SERVICES_CACHE_KEY, services, CACHE_TTL.SERVICES);

  return sendSuccess(res, 'Services retrieved successfully', { services, data: services });
});

export const getServiceById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const cacheKey = `public:services:item:${req.params.id}`;
  const cached = await cacheService.get<any>(cacheKey);
  if (cached) {
    return sendSuccess(res, 'Service details retrieved (cached)', { service: cached, data: cached });
  }

  const service = await ServiceModel.findServiceById(req.params.id);
  if (!service) {
    throw new NotFoundError('Service not found');
  }

  await cacheService.set(cacheKey, service, CACHE_TTL.SERVICES);

  return sendSuccess(res, 'Service details retrieved', { service, data: service });
});

export const createService = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { title, name, description, price, category, icon, image, features } = req.body;
  const serviceData = {
    title: title || name,
    name: name || title,
    description: description || '',
    price: price ? parseFloat(price) : 0,
    category: category || 'General',
    icon: icon || 'fa-cog',
    image: image || req.body.imageUrl || '',
    features: features || []
  };

  const newService = await ServiceModel.createService(serviceData);

  // Invalidate services cache
  await cacheService.del(SERVICES_CACHE_KEY);

  return sendSuccess(res, 'Service created successfully', { service: newService, data: newService }, 201);
});

export const updateService = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updated = await ServiceModel.updateServiceById(req.params.id, req.body);
  if (!updated) {
    throw new NotFoundError('Service not found');
  }

  // Invalidate services cache
  await cacheService.del(SERVICES_CACHE_KEY);
  await cacheService.del(`public:services:item:${req.params.id}`);

  return sendSuccess(res, 'Service updated successfully', { service: updated, data: updated });
});

export const deleteService = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const deleted = await ServiceModel.deleteServiceById(req.params.id);
  if (!deleted) {
    throw new NotFoundError('Service not found');
  }

  // Invalidate services cache
  await cacheService.del(SERVICES_CACHE_KEY);
  await cacheService.del(`public:services:item:${req.params.id}`);

  return sendSuccess(res, 'Service deleted successfully');
});

export const createOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
  const filesList = Array.isArray(req.files) ? (req.files as any[]).map(f => ({
    filename: f.filename,
    originalname: f.originalname,
    path: `/uploads/${f.filename}`,
    mimetype: f.mimetype,
    size: f.size
  })) : [];

  const orderData = {
    ...req.body,
    orderNumber,
    userEmail: req.body.userEmail || req.body.email || req.user?.email || 'guest@icsrt.cloud',
    userName: req.body.userName || req.body.fullName || req.body.name || req.user?.name || 'Guest User',
    serviceTitle: req.body.serviceTitle || req.body.serviceType || 'Requested Service',
    requirements: req.body.requirements || req.body.projectDetails || '',
    files: filesList,
    status: 'pending',
    pricingStatus: req.body.price ? 'priced' : 'pending_pricing'
  };

  const newOrder = await ServiceModel.createOrder(orderData);
  return sendSuccess(res, 'Service order submitted successfully', { order: newOrder, data: newOrder }, 201);
});

export const getAdminOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : (req.query.page ? (parseInt(req.query.page as string, 10) - 1) * (limit || 20) : undefined);

  const orders = await ServiceModel.findOrders({}, { limit, skip });
  return sendSuccess(res, 'Service orders retrieved', { orders, data: orders, count: orders.length });
});

export const getUserOrders = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
  let email: string | undefined;

  if (isAdmin && (req.query.userEmail || req.query.email)) {
    email = ((req.query.userEmail as string) || (req.query.email as string)).toLowerCase().trim();
  } else if (req.user?.email) {
    email = req.user.email.toLowerCase().trim();
  }

  if (!email) {
    throw new BadRequestError('User email address is required to query orders');
  }

  const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string, 10), 100) : undefined;
  const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : (req.query.page ? (parseInt(req.query.page as string, 10) - 1) * (limit || 20) : undefined);

  const orders = await ServiceModel.findOrders({ userEmail: email }, { limit, skip });
  return sendSuccess(res, 'User service orders retrieved', { orders, data: orders });
});

export const getOrderById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await ServiceModel.findOrderById(req.params.id);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
  const isOwner = (order.userEmail && req.user?.email && order.userEmail.toLowerCase() === req.user.email.toLowerCase()) ||
                  (order.userId && req.user?.userId && order.userId.toString() === req.user.userId.toString());

  if (!isAdmin && !isOwner) {
    throw new ForbiddenError('You are not authorized to view this order');
  }

  return sendSuccess(res, 'Order details retrieved', { order, data: order });
});

export const updateOrderStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { status, notes } = req.body;
  const updatedOrder = await ServiceModel.updateOrderById(req.params.id, {
    status,
    adminNotes: notes
  });
  if (!updatedOrder) {
    throw new NotFoundError('Order not found');
  }
  return sendSuccess(res, 'Order status updated successfully', { order: updatedOrder, data: updatedOrder });
});

export const setOrderPrice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { price, currency, notes } = req.body;
  const parsedPrice = typeof price === 'number' ? price : parseFloat(price);
  if (isNaN(parsedPrice)) {
    throw new BadRequestError('A valid numeric price is required');
  }

  const updatedOrder = await ServiceModel.updateOrderById(req.params.id, {
    price: parsedPrice,
    currency: currency || 'USD',
    pricingNotes: notes,
    pricingStatus: 'priced'
  });

  if (!updatedOrder) {
    throw new NotFoundError('Order not found');
  }

  return sendSuccess(res, 'Order pricing set successfully', { order: updatedOrder, data: updatedOrder });
});

export const generatePurchaseLink = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const order = await ServiceModel.findOrderById(req.params.orderId);
  if (!order) {
    throw new NotFoundError('Order not found');
  }

  const purchaseToken = generateToken(24);
  const purchaseLink = `${req.protocol}://${req.get('host')}/api/purchase-link/${purchaseToken}`;

  await ServiceModel.updateOrderById(order._id, {
    purchaseToken,
    purchaseLink,
    purchaseTokenExpires: new Date(Date.now() + 7 * 24 * 3600 * 1000)
  });

  return sendSuccess(res, 'Purchase link generated successfully', {
    purchaseToken,
    purchaseLink,
    order
  });
});

export const getPurchaseLinkDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token } = req.params;
  const orders = await ServiceModel.findOrders({ purchaseToken: token });
  if (!orders || orders.length === 0) {
    throw new NotFoundError('Invalid or expired purchase link');
  }
  return sendSuccess(res, 'Purchase details retrieved', { order: orders[0], data: orders[0] });
});
