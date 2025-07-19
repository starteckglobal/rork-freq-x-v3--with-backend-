import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockReports } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const updateReportStatusSchema = z.object({
  reportId: z.string(),
  status: z.enum(['Open', 'Investigating', 'Resolved', 'Dismissed']),
  notes: z.string().optional(),
});

export const updateReportStatusProcedure = requirePermission('content_moderation:flag')
  .input(updateReportStatusSchema)
  .mutation(async ({ input, ctx }) => {
    const reportIndex = mockReports.findIndex(r => r.id === input.reportId);
    
    if (reportIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Report not found',
      });
    }

    const oldStatus = mockReports[reportIndex].status;
    mockReports[reportIndex].status = input.status;
    mockReports[reportIndex].assigned_moderator = ctx.adminUser.id;
    
    if (input.status === 'Resolved' || input.status === 'Dismissed') {
      mockReports[reportIndex].resolved_at = new Date();
      mockReports[reportIndex].resolution_notes = input.notes;
    }

    // In production, you would:
    // 1. Update database
    // 2. Send notification to reporter
    // 3. Log the action
    // 4. If resolved, take appropriate action on reported content

    console.log(`Admin ${ctx.adminUser.username} updated report ${input.reportId} from ${oldStatus} to ${input.status}`);
    if (input.notes) {
      console.log(`Notes: ${input.notes}`);
    }

    return {
      success: true,
      report: mockReports[reportIndex],
      message: `Report status updated to ${input.status}`,
    };
  });

export default updateReportStatusProcedure;