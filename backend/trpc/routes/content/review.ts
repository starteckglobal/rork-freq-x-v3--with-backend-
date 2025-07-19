import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockTracks } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const reviewContentSchema = z.object({
  trackId: z.string(),
  action: z.enum(['approve', 'reject']),
  notes: z.string().optional(),
  flags: z.array(z.string()).optional().default([]),
});

export const reviewContentProcedure = requirePermission('content_moderation:approve')
  .input(reviewContentSchema)
  .mutation(async ({ input, ctx }) => {
    const trackIndex = mockTracks.findIndex(t => t.id === input.trackId);
    
    if (trackIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Track not found',
      });
    }

    const track = mockTracks[trackIndex];
    
    if (track.status !== 'pending') {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Track has already been reviewed',
      });
    }

    // Update track status
    mockTracks[trackIndex].status = input.action === 'approve' ? 'approved' : 'rejected';
    mockTracks[trackIndex].reviewed_at = new Date();
    mockTracks[trackIndex].reviewer_id = ctx.adminUser.id;

    // In production, you would:
    // 1. Update database
    // 2. Send notification to artist
    // 3. Log the review action
    // 4. If rejected, provide feedback
    // 5. If approved, make track available

    console.log(`Admin ${ctx.adminUser.username} ${input.action}d track \"${track.title}\" (ID: ${input.trackId})`);
    if (input.notes) {
      console.log(`Review notes: ${input.notes}`);
    }
    if (input.flags.length > 0) {
      console.log(`Flags: ${input.flags.join(', ')}`);
    }

    return {
      success: true,
      track: mockTracks[trackIndex],
      message: `Track ${input.action}d successfully`,
    };
  });

export default reviewContentProcedure;