import { z } from 'zod';

const stringToArray = z.preprocess((val) => {
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return val;
}, z.array(z.string()).optional());

export const createArticleSchema = z.object({
  body: z.object({
    title: z.string({ message: 'Article title is required' }).min(3, 'Title must be at least 3 characters'),
    content: z.string().optional(),
    summary: z.string().optional(),
    author: z.string().optional(),
    authors: z.string().optional(),
    category: z.string().optional(),
    journal: z.string().optional(),
    tags: stringToArray,
    image: z.string().optional(),
    imageUrl: z.string().optional(),
    slug: z.string().optional()
  })
});
