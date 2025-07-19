import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockSyncOpportunities } from '../../../database/mock-data';
import { TRPCError } from '@trpc/server';

const updateSyncSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  budget_range: z.string().optional(),
  genre_preferences: z.array(z.string()).optional(),
  deadline: z.string().transform(str => new Date(str)).optional(),
  requirements: z.string().optional(),
  contact_info: z.string().optional(),
  status: z.enum(['active', 'closed', 'draft']).optional(),
});

export const updateSyncOpportunityProcedure = requirePermission('synclab:manage')
  .input(updateSyncSchema)
  .mutation(async ({ input }) => {
    const { id, ...updates } = input;
    
    const opportunityIndex = mockSyncOpportunities.findIndex(sync => sync.id === id);
    
    if (opportunityIndex === -1) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Sync opportunity not found',
      });
    }
    
    mockSyncOpportunities[opportunityIndex] = {
      ...mockSyncOpportunities[opportunityIndex],
      ...updates,
      updated_at: new Date(),
    };
    
    return {
      success: true,
      opportunity: mockSyncOpportunities[opportunityIndex]
    };
  });

export default updateSyncOpportunityProcedure;