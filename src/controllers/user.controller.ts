import { Response } from 'express';
import UserModel from '../models/User.model';
import { sendSuccess } from '../utils/response';
import { sanitizeUser } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';
import { asyncHandler } from '../utils/asyncHandler';
import { NotFoundError, ForbiddenError } from '../utils/errors';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const users = await UserModel.findAll({}, { password: 0 });
  return sendSuccess(res, 'Users retrieved successfully', { users, data: users });
});

export const getUserStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const totalUsers = await UserModel.count();
  const verifiedUsers = await UserModel.count({ isVerified: true });
  const adminCount = await UserModel.count({ role: { $in: ['admin', 'super_admin'] } });

  return sendSuccess(res, 'User statistics retrieved', {
    stats: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminCount
    }
  });
});

export const getUserById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isOwner = req.user?.userId === req.params.id;
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('You are not authorized to view this user profile');
  }

  const user = await UserModel.findById(req.params.id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sendSuccess(res, 'User retrieved', { user: sanitizeUser(user) });
});

export const updateUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const isOwner = req.user?.userId === req.params.id;
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';

  if (!isOwner && !isAdmin) {
    throw new ForbiddenError('You are not authorized to update this user profile');
  }

  const { name, phone, organization, country, role } = req.body;
  const updatePayload: Record<string, any> = {};
  if (name !== undefined) updatePayload.name = name;
  if (phone !== undefined) updatePayload.phone = phone;
  if (organization !== undefined) updatePayload.organization = organization;
  if (country !== undefined) updatePayload.country = country;
  if (role !== undefined && isAdmin) {
    updatePayload.role = role;
  }

  const updatedUser = await UserModel.updateById(req.params.id, updatePayload);
  if (!updatedUser) {
    throw new NotFoundError('User not found');
  }

  return sendSuccess(res, 'User updated successfully', { user: sanitizeUser(updatedUser) });
});

export const deleteUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const targetUser = await UserModel.findById(req.params.id);
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  if (targetUser.role === 'super_admin') {
    throw new ForbiddenError('Super Admin accounts cannot be deleted');
  }

  const deleted = await UserModel.deleteById(req.params.id);
  if (!deleted) {
    throw new NotFoundError('User not found');
  }
  return sendSuccess(res, 'User deleted successfully');
});
