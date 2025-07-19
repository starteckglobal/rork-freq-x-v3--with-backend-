import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockSyncOpportunities } from '../../../database/mock-data';

const createSyncSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  brand: z.string().min(1, 'Brand is required'),
  budget_range: z.string().min(1, 'Budget range is required'),
  genre_preferences: z.array(z.string()),
  deadline: z.string().transform(str => new Date(str)),
  requirements: z.string(),
  contact_info: z.string().min(1, 'Contact info is required'),
});

export const createSyncOpportunityProcedure = requirePermission('synclab:create')
  .input(createSyncSchema)
  .mutation(async ({ input, ctx }) => {
    const newOpportunity = {
      id: (mockSyncOpportunities.length + 1).toString(),
      ...input,
      status: 'active' as const,
      created_by: ctx.adminUser.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    
    mockSyncOpportunities.push(newOpportunity);
    
    return {
      success: true,
      opportunity: newOpportunity
    };
  });

export default createSyncOpportunityProcedure;