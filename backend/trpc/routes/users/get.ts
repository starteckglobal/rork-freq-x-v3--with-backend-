import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockUsers } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const getUserSchema = z.object({
  userId: z.string(),
});

export const getUserProcedure = requirePermission('user_management:view')
  .input(getUserSchema)
  .query(async ({ input }) => {
    const user = mockUsers.find(u => u.id === input.userId);
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return { user };
  });

export default getUserProcedure;