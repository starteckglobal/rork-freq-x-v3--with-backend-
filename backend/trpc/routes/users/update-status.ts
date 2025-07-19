import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockUsers } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const updateStatusSchema = z.object({
  userId: z.string(),
  status: z.enum(['Active', 'Suspended', 'Banned']),
  reason: z.string().min(1, 'Reason is required'),
});

export const updateStatusProcedure = requirePermission('user_management:ban')
  .input(updateStatusSchema)
  .mutation(async ({ input, ctx }) => {
    const userIndex = mockUsers.findIndex(u => u.id === input.userId);
    
    if (userIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    const oldStatus = mockUsers[userIndex].status;
    mockUsers[userIndex].status = input.status;
    mockUsers[userIndex].updated_at = new Date();

    // In production, you would:
    // 1. Update database
    // 2. Send notification email to user
    // 3. Log the action for audit trail
    // 4. If banning, revoke active sessions

    console.log(`Admin ${ctx.adminUser.username} changed user ${input.userId} status from ${oldStatus} to ${input.status}. Reason: ${input.reason}`);

    return {
      success: true,
      user: mockUsers[userIndex],
      message: `User status updated to ${input.status}`,
    };
  });

export default updateStatusProcedure;