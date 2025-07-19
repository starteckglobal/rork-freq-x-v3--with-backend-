import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockUsers } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const sendMessageSchema = z.object({
  userId: z.string(),
  message: z.string().min(1, 'Message cannot be empty'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  subject: z.string().min(1, 'Subject is required'),
});

export const sendMessageProcedure = requirePermission('user_management:edit')
  .input(sendMessageSchema)
  .mutation(async ({ input, ctx }) => {
    const user = mockUsers.find(u => u.id === input.userId);
    
    if (!user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    // In production, you would:
    // 1. Send in-app notification
    // 2. Send email notification
    // 3. Store message in database
    // 4. Log the action

    console.log(`Admin ${ctx.adminUser.username} sent message to user ${user.email}:`);
    console.log(`Subject: ${input.subject}`);
    console.log(`Priority: ${input.priority}`);
    console.log(`Message: ${input.message}`);

    return {
      success: true,
      message: `Message sent to ${user.name}`,
      sentAt: new Date(),
    };
  });

export default sendMessageProcedure;