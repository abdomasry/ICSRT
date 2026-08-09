import { Response } from 'express';
import bcrypt from 'bcryptjs';
import UserModel from '../models/User.model';
import { signToken } from '../services/token.service';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email.service';
import { sendSuccess, sendError } from '../utils/response';
import { generateToken, sanitizeUser } from '../utils/helpers';
import { validateSignupPayload, validateEmail } from '../validators/auth.validator';
import { BCRYPT_ROUNDS } from '../config/env';
import { AuthenticatedRequest } from '../types';

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function adminLogin(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    const user = await UserModel.findByEmail(email);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return sendError(res, 'Invalid admin credentials', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      return sendError(res, 'Invalid admin credentials', 401);
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function signup(req: AuthenticatedRequest, res: Response) {
  try {
    const validation = validateSignupPayload(req.body);
    if (!validation.isValid) {
      return sendError(res, validation.errors.join(', '), 400);
    }

    const existingUser = await UserModel.findByEmail(req.body.email);
    if (existingUser) {
      return sendError(res, 'An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(req.body.password, BCRYPT_ROUNDS);
    const verificationToken = generateToken();

    const newUser = await UserModel.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone || '',
      country: req.body.country || '',
      organization: req.body.organization || '',
      role: 'user',
      isVerified: false,
      verificationToken
    });

    await sendVerificationEmail(newUser.email, verificationToken, newUser.name);

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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function verifyEmail(req: AuthenticatedRequest, res: Response) {
  try {
    const token = req.params.token || req.body.token;
    if (!token) {
      return sendError(res, 'Verification token is required', 400);
    }

    const user = await UserModel.findByVerificationToken(token);
    if (!user) {
      return sendError(res, 'Invalid or expired verification token', 400);
    }

    await UserModel.updateById(user._id, {
      isVerified: true,
      verificationToken: null
    });

    return sendSuccess(res, 'Email address verified successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function resendVerification(req: AuthenticatedRequest, res: Response) {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return sendError(res, 'Valid email is required', 400);
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendError(res, 'User not found', 444);
    }

    if (user.isVerified) {
      return sendSuccess(res, 'Email is already verified');
    }

    const verificationToken = user.verificationToken || generateToken();
    if (!user.verificationToken) {
      await UserModel.updateById(user._id, { verificationToken });
    }

    await sendVerificationEmail(user.email, verificationToken, user.name);

    return sendSuccess(res, 'Verification email sent');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return sendError(res, 'Current password and new password are required', 400);
    }

    const user = await UserModel.findById(req.user?.userId);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password || '');
    if (!isMatch) {
      return sendError(res, 'Incorrect current password', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await UserModel.updateById(user._id, { password: hashedPassword });

    return sendSuccess(res, 'Password changed successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { email } = req.body;
    if (!validateEmail(email)) {
      return sendError(res, 'Valid email address is required', 400);
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return sendSuccess(res, 'If an account exists with this email, password reset instructions have been sent.');
    }

    const resetToken = generateToken();
    const resetExpires = new Date(Date.now() + 3600000);

    await UserModel.updateById(user._id, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: resetExpires
    });

    await sendPasswordResetEmail(user.email, resetToken, user.name);

    return sendSuccess(res, 'If an account exists with this email, password reset instructions have been sent.');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 'Token and new password are required', 400);
    }

    const user = await UserModel.findByResetToken(token);
    if (!user) {
      return sendError(res, 'Invalid or expired password reset token', 400);
    }

    const hashedPassword = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    await UserModel.updateById(user._id, {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null
    });

    return sendSuccess(res, 'Password reset successful. You may now login with your new password.');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
