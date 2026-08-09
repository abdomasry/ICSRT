import { Response } from 'express';
import UserModel from '../models/User.model';
import ServiceModel from '../models/Service.model';
import TicketModel from '../models/Ticket.model';
import { sendSuccess, sendError } from '../utils/response';
import { AuthenticatedRequest } from '../types';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    const totalUsers = await UserModel.count();
    const totalOrders = await ServiceModel.countOrders();
    const totalTickets = await TicketModel.count();
    const openTickets = await TicketModel.count({ status: 'open' });
    const pendingOrders = await ServiceModel.countOrders({ status: 'pending' });

    return sendSuccess(res, 'Dashboard metrics retrieved', {
      stats: {
        totalUsers,
        totalOrders,
        pendingOrders,
        totalTickets,
        openTickets
      }
    });
  } catch (error: any) {
    return sendError(res, error.message, 500);
  }
}
