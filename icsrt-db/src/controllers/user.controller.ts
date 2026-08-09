import { Response } from 'express';
import UserModel from '../models/User.model';
import { sendSuccess, sendError } from '../utils/response';
import { sanitizeUser } from '../utils/helpers';
import { AuthenticatedRequest } from '../types';

export async function getUsers(req: AuthenticatedRequest, res: Response) {
  try {
    const users = await UserModel.findAll({}, { password: 0 });
    return sendSuccess(res, 'Users retrieved successfully', { users, data: users });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getUserStats(req: AuthenticatedRequest, res: Response) {
  try {
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
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function getUserById(req: AuthenticatedRequest, res: Response) {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User retrieved', { user: sanitizeUser(user) });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function updateUser(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, phone, organization, country, role } = req.body;
    const updatePayload: Record<string, any> = {};
    if (name !== undefined) updatePayload.name = name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (organization !== undefined) updatePayload.organization = organization;
    if (country !== undefined) updatePayload.country = country;
    if (role !== undefined && (req.user?.role === 'admin' || req.user?.role === 'super_admin')) {
      updatePayload.role = role;
    }

    const updatedUser = await UserModel.updateById(req.params.id, updatePayload);
    if (!updatedUser) {
      return sendError(res, 'User not found', 404);
    }

    return sendSuccess(res, 'User updated successfully', { user: sanitizeUser(updatedUser) });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response) {
  try {
    const deleted = await UserModel.deleteById(req.params.id);
    if (!deleted) {
      return sendError(res, 'User not found', 404);
    }
    return sendSuccess(res, 'User deleted successfully');
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
