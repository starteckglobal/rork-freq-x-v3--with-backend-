import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockReports } from '../../../database/mock-data';

const listReportsSchema = z.object({
  status: z.enum(['Open', 'Investigating', 'Resolved', 'Dismissed', 'All']).optional().default('All'),
  severity: z.enum(['High', 'Medium', 'Low', 'All']).optional().default('All'),
  type: z.enum(['Copyright', 'Inappropriate Content', 'Spam', 'Other', 'All']).optional().default('All'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const listReportsProcedure = requirePermission('content_moderation:flag')
  .input(listReportsSchema)
  .query(async ({ input }) => {
    let filteredReports = [...mockReports];

    // Apply filters
    if (input.status !== 'All') {
      filteredReports = filteredReports.filter(report => report.status === input.status);
    }

    if (input.severity !== 'All') {
      filteredReports = filteredReports.filter(report => report.severity === input.severity);
    }

    if (input.type !== 'All') {
      filteredReports = filteredReports.filter(report => report.type === input.type);
    }

    // Sort by severity (High first) then by creation date (newest first)
    filteredReports.sort((a, b) => {
      const severityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.created_at.getTime() - a.created_at.getTime();
    });

    // Pagination
    const total = filteredReports.length;
    const reports = filteredReports.slice(input.offset, input.offset + input.limit);

    return {
      reports,
      total,
      hasMore: input.offset + input.limit < total,
    };
  });

export default listReportsProcedure;