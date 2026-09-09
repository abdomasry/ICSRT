import { z } from 'zod';

const stringToArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string()).optional());

export const createServiceSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Service title is required' }).min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    icon: z.string().optional(),
    features: stringToArray,
    price: z.number().or(z.string()).optional(),
    category: z.string().optional(),
    name: z.string().optional(),
    image: z.string().optional(),
    imageUrl: z.string().optional()
  }).passthrough()
});

export const createOrderSchema = z.object({
  body: z.object({
    serviceId: z.string().optional(),
    serviceType: z.string().optional(),
    serviceTitle: z.string().optional(),
    userEmail: z.string().optional(),
    email: z.string().optional(),
    userName: z.string().optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    requirements: z.string().optional(),
    projectDetails: z.string().optional(),
    urgency: z.string().optional(),
    files: z.array(z.any()).optional()
  }).passthrough()
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'processing', 'priced', 'paid', 'completed', 'cancelled']),
    notes: z.string().optional()
  }).passthrough()
});

export const setOrderPriceSchema = z.object({
  body: z.object({
    price: z.number().or(z.string().transform((val) => parseFloat(val))),
    currency: z.string().optional(),
    notes: z.string().optional()
  }).passthrough()
});
