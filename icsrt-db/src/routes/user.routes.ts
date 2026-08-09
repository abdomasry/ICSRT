import express from 'express';
import * as userController from '../controllers/user.controller';
import { requireAdmin, requireUser } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/stats', requireAdmin, userController.getUserStats);
router.get('/', requireAdmin, userController.getUsers);
router.get('/:id', requireUser, userController.getUserById);
router.put('/:id', requireUser, userController.updateUser);
router.delete('/:id', requireAdmin, userController.deleteUser);

export default router;
