import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockAnalytics } from '../../../database/mock-data';

const overviewSchema = z.object({
  period: z.enum(['24h', '7d', '30d', '90d', '1y']).optional().default('30d'),
});

export const overviewAnalyticsProcedure = requirePermission('analytics:view')
  .input(overviewSchema)
  .query(async ({ input }) => {
    // In production, you would query actual analytics data based on the period
    // For now, we'll return mock data with some period-based variations
    
    const baseData = mockAnalytics.overview;
    
    // Simulate different data based on period
    const periodMultipliers = {
      '24h': 0.1,
      '7d': 0.3,
      '30d': 1.0,
      '90d': 2.5,
      '1y': 12.0,
    };
    
    const multiplier = periodMultipliers[input.period];
    
    return {
      period: input.period,
      metrics: {
        totalUsers: Math.floor(baseData.totalUsers * multiplier),
        activeUsers: Math.floor(baseData.activeUsers * multiplier),
        totalTracks: Math.floor(baseData.totalTracks * multiplier),
        pendingReviews: baseData.pendingReviews,
        openTickets: baseData.openTickets,
        monthlyRevenue: Math.floor(baseData.monthlyRevenue * multiplier),
      },
      trends: {
        userGrowth: input.period === '30d' ? '+12.5%' : '+8.2%',
        revenueGrowth: input.period === '30d' ? '+15.3%' : '+9.1%',
        trackUploads: input.period === '30d' ? '+22.1%' : '+18.7%',
      },
      lastUpdated: new Date(),
    };
  });

export default overviewAnalyticsProcedure;