import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('A valid email address is required'),
    password: z.string({ message: 'Password is required' }).min(1, 'Password cannot be empty')
  })
});

export const signupSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('A valid email address is required'),
    password: z.string({ message: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    name: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    fullName: z.string().optional(),
    phone: z.string().optional(),
    country: z.string().optional(),
    organization: z.string().optional(),
    institution: z.string().optional(),
    userType: z.string().optional()
  }).refine((data) => Boolean(data.name || data.fullName || data.firstName || data.lastName), {
    message: 'Name is required (provide name, fullName, or firstName/lastName)',
    path: ['name']
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string({ message: 'Current password is required' }),
    newPassword: z.string({ message: 'New password is required' }).min(6, 'New password must be at least 6 characters')
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string({ message: 'Email is required' }).email('A valid email address is required')
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string({ message: 'Token is required' }),
    newPassword: z.string({ message: 'New password is required' }).min(6, 'New password must be at least 6 characters')
  })
});
