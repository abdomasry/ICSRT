import { Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User.model';
import { signToken } from '../services/token.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSuccess } from '../utils/response';
import { generateToken, sanitizeUser } from '../utils/helpers';
import { BCRYPT_ROUNDS } from '../config/env';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { UnauthorizedError, ConflictError, BadRequestError, NotFoundError } from '../utils/errors';

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const token = signToken({
    userId: user._id!.toString(),
    email: user.email,
    name: user.name,
    role: user.role || 'user'
  });

  return sendSuccess(res, 'Login successful', {
    token,
    user: sanitizeUser(user)
  });
});

export const adminLogin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;
  const user = await UserModel.findByEmail(email);
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    throw new UnauthorizedError('Invalid admin credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password || '');
  if (!isMatch) {
    throw new UnauthorizedError('Invalid admin credentials');
  }

  const token = signToken({
    userId: user._id!.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  });

  return sendSuccess(res, 'Admin login successful', {
    token,
    user: sanitizeUser(user)
  });
});

export const signup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const existingUser = await UserModel.findByEmail(req.body.email);
  if (existingUser) {
    throw new ConflictError('An account with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_ROUNDS);
  const verificationToken = generateToken();

  const name = req.body.name || req.body.fullName || `${req.body.firstName || ''} ${req.body.lastName || ''}`.trim();

  const newUser = await UserModel.create({
    name,
    email: req.body.email,
    password: hashedPassword,
    phone: req.body.phone || '',
    country: req.body.country || '',
    organization: req.body.organization || req.body.institution || '',
    role: 'user',
    isVerified: false,
    verificationToken
  });

  try {
    await sendVerificationEmail(newUser.email, verificationToken, newUser.name);
  } catch (e) {
    // Non-blocking email sending fallback
  }

  const token = signToken({
    userId: newUser._id!.toString(),
    email: newUser.email,
    name: newUser.name,
    role: 'user'
  });

  return sendSuccess(res, 'Account created successfully. Please check your email to verify your account.', {
    token,
    user: sanitizeUser(newUser)
  }, 201);
});

export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const token = req.params.token || req.body.token;
  if (!token) {
    throw new BadRequestError('Verification token is required');
  }

  const user = await UserModel.findByVerificationToken(token);
  if (!user) {
    throw new BadRequestError('Invalid or expired verification token');
  }

  await UserModel.updateById(user._id, {
    isVerified: true,
    verificationToken: null
  });

  return sendSuccess(res, 'Email address verified successfully');
});

export const resendVerification = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  const user = await UserModel.findByEmail(email);
  if (!user) {
    throw new NotFoundError('User account not found');
  }

  if (user.isVerified) {
    return sendSuccess(res, 'Email is already verified');
  }

  const verificationToken = user.verificationToken || generateToken();
  if (!user.verificationToken) {
    await UserModel.updateById(user._id, { verificationToken });
  }

  await sendVerificationEmail(user.email, verificationToken, user.name);
  return sendSuccess(res, 'Verification email sent successfully');
});

export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user?.userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password || '');
  if (!isMatch) {
    throw new BadRequestError('Incorrect current password');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await UserModel.updateById(user._id, { password: hashedPassword });

  return sendSuccess(res, 'Password changed successfully');
});

export const forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  const user = await UserModel.findByEmail(email);
  if (user) {
    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 3600000);

    await UserModel.updateById(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    try {
      await sendPasswordResetEmail(user.email, resetToken, user.name);
    } catch (e) {
      // Non-blocking
    }
  }

  return sendSuccess(res, 'If an account exists with this email, password reset instructions have been sent.');
});

export const resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, newPassword } = req.body;
  const user = await UserModel.findByResetToken(token);
  if (!user) {
    throw new BadRequestError('Invalid or expired password reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await UserModel.updateById(user._id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null
  });

  return sendSuccess(res, 'Password reset successful. You may now login with your new password.');
});
