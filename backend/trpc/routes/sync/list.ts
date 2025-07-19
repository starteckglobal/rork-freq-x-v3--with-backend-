import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockSyncOpportunities } from '../../../database/mock-data';

const listSyncSchema = z.object({
  status: z.enum(['active', 'closed', 'draft']).optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

export const listSyncOpportunitiesProcedure = requirePermission('synclab:manage')
  .input(listSyncSchema)
  .query(async ({ input }) => {
    const { status, limit, offset } = input;
    
    let filtered = mockSyncOpportunities;
    
    if (status) {
      filtered = filtered.filter(sync => sync.status === status);
    }
    
    const total = filtered.length;
    const opportunities = filtered.slice(offset, offset + limit);
    
    return {
      opportunities,
      total,
      hasMore: offset + limit < total
    };
  });

export default listSyncOpportunitiesProcedure;