import { Response } from 'express';
import ServiceModel from '../models/Service.model';
import { sendSuccess, sendError } from '../utils/response';
import { generateToken } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

export async function getServices(req: AuthenticatedRequest, res: Response) {
  try {
    const services = await ServiceModel.findAllServices();
    return sendSuccess(res, 'Services retrieved', { services, data: services });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getServiceById(req: AuthenticatedRequest, res: Response) {
  try {
    const service = await ServiceModel.findServiceById(req.params.id);
    if (!service) {
      return sendError(res, 'Service not found', 404);
    }
    return sendSuccess(res, 'Service details retrieved', { service, data: service });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createService(req: AuthenticatedRequest, res: Response) {
  try {
    const { title, name, description, price, category, icon, image, features } = req.body;
    if (!title && !name) {
      return sendError(res, 'Service title or name is required', 400);
    }

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
    return sendSuccess(res, 'Service created successfully', { service: newService, data: newService }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateService(req: AuthenticatedRequest, res: Response) {
  try {
    const updated = await ServiceModel.updateServiceById(req.params.id, req.body);
    if (!updated) {
      return sendError(res, 'Service not found', 404);
    }
    return sendSuccess(res, 'Service updated successfully', { service: updated, data: updated });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteService(req: AuthenticatedRequest, res: Response) {
  try {
    const deleted = await ServiceModel.deleteServiceById(req.params.id);
    if (!deleted) {
      return sendError(res, 'Service not found', 404);
    }
    return sendSuccess(res, 'Service deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  try {
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const orderData = {
      ...req.body,
      orderNumber,
      userEmail: req.body.userEmail || req.body.email,
      status: 'pending',
      pricingStatus: req.body.price ? 'priced' : 'pending_pricing'
    };

    const newOrder = await ServiceModel.createOrder(orderData);
    return sendSuccess(res, 'Service order submitted successfully', { order: newOrder, data: newOrder }, 201);
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getAdminOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const orders = await ServiceModel.findOrders();
    return sendSuccess(res, 'Orders retrieved', { orders, data: orders, count: orders.length });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getUserOrders(req: AuthenticatedRequest, res: Response) {
  try {
    const email = req.user?.email || (req.query.userEmail as string) || (req.query.email as string);
    if (!email) {
      return sendError(res, 'User email required', 400);
    }
    const orders = await ServiceModel.findOrders({ userEmail: email });
    return sendSuccess(res, 'User service orders retrieved', { orders, data: orders });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getOrderById(req: AuthenticatedRequest, res: Response) {
  try {
    const order = await ServiceModel.findOrderById(req.params.id);
    if (!order) {
      return sendError(res, 'Order not found', 404);
    }
    return sendSuccess(res, 'Order retrieved', { order, data: order });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { status, notes } = req.body;
    const updatedOrder = await ServiceModel.updateOrderById(req.params.id, {
      status,
      adminNotes: notes
    });
    if (!updatedOrder) {
      return sendError(res, 'Order not found', 404);
    }
    return sendSuccess(res, 'Order status updated', { order: updatedOrder, data: updatedOrder });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function setOrderPrice(req: AuthenticatedRequest, res: Response) {
  try {
    const { price, currency, notes } = req.body;
    if (!price || isNaN(price)) {
      return sendError(res, 'Valid price is required', 400);
    }

    const updatedOrder = await ServiceModel.updateOrderById(req.params.id, {
      price: parseFloat(price),
      currency: currency || 'USD',
      pricingNotes: notes,
      pricingStatus: 'priced'
    });

    if (!updatedOrder) {
      return sendError(res, 'Order not found', 404);
    }

    return sendSuccess(res, 'Order pricing set successfully', { order: updatedOrder, data: updatedOrder });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function generatePurchaseLink(req: AuthenticatedRequest, res: Response) {
  try {
    const order = await ServiceModel.findOrderById(req.params.orderId);
    if (!order) {
      return sendError(res, 'Order not found', 404);
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getPurchaseLinkDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const { token } = req.params;
    const orders = await ServiceModel.findOrders({ purchaseToken: token });
    if (!orders || orders.length === 0) {
      return sendError(res, 'Invalid or expired purchase link', 404);
    }
    return sendSuccess(res, 'Purchase details retrieved', { order: orders[0], data: orders[0] });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
