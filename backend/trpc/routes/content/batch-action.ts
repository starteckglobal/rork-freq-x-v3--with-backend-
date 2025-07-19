import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockTracks } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const batchActionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  trackIds: z.array(z.string()).min(1, 'At least one track ID is required'),
  reason: z.string().min(1, 'Reason is required for batch actions'),
});

export const batchActionProcedure = requirePermission('content_moderation:approve')
  .input(batchActionSchema)
  .mutation(async ({ input, ctx }) => {
    const updatedTracks = [];
    const errors = [];

    for (const trackId of input.trackIds) {
      const trackIndex = mockTracks.findIndex(t => t.id === trackId);
      
      if (trackIndex === -1) {
        errors.push({ trackId, error: 'Track not found' });
        continue;
      }

      const track = mockTracks[trackIndex];
      
      if (track.status !== 'pending') {
        errors.push({ trackId, error: 'Track already reviewed' });
        continue;
      }

      // Update track
      mockTracks[trackIndex].status = input.action === 'approve' ? 'approved' : 'rejected';
      mockTracks[trackIndex].reviewed_at = new Date();
      mockTracks[trackIndex].reviewer_id = ctx.adminUser.id;
      
      updatedTracks.push(mockTracks[trackIndex]);
    }

    // In production, you would:
    // 1. Use database transactions for batch operations
    // 2. Send batch notifications to artists
    // 3. Log all actions
    // 4. Handle partial failures gracefully

    console.log(`Admin ${ctx.adminUser.username} performed batch ${input.action} on ${updatedTracks.length} tracks`);
    console.log(`Reason: ${input.reason}`);

    return {
      success: true,
      updatedTracks,
      errors,
      message: `Batch ${input.action} completed. ${updatedTracks.length} tracks updated, ${errors.length} errors.`,
    };
  });

export default batchActionProcedure;