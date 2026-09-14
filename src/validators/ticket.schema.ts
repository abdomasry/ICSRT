import { z } from 'zod';

export const createTicketSchema = z.object({
  body: z.object({
    subject: z.string({ message: 'Subject is required' }).min(2, 'Subject must be at least 2 characters'),
    message: z.string({ message: 'Message content is required' }).min(5, 'Message must be at least 5 characters'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    category: z.string().optional(),
    userEmail: z.string().email().optional(),
    userName: z.string().optional()
  })
});

export const addReplySchema = z.object({
  body: z.object({
    message: z.string({ message: 'Reply message is required' }).min(1, 'Reply message cannot be empty'),
    sender: z.string().optional()
  })
});
