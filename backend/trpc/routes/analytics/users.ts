import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockAnalytics } from '../../../database/mock-data';

const userAnalyticsSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  metric: z.enum(['growth', 'engagement', 'retention', 'demographics']).optional().default('growth'),
});

export const userAnalyticsProcedure = requirePermission('analytics:view')
  .input(userAnalyticsSchema)
  .query(async ({ input }) => {
    // In production, you would query actual user analytics data
    
    if (input.metric === 'growth') {
      return {
        metric: 'growth',
        period: input.period,
        data: mockAnalytics.userGrowth,
        summary: {
          totalGrowth: '54.2%',
          averageDaily: '1.8%',
          peakDay: '2024-02-15',
          peakGrowth: '3.2%',
        },
      };
    }
    
    if (input.metric === 'engagement') {
      return {
        metric: 'engagement',
        period: input.period,
        data: [
          { date: '2024-01-01', dailyActiveUsers: 8500, sessionsPerUser: 2.3, avgSessionDuration: 18.5 },
          { date: '2024-02-01', dailyActiveUsers: 9200, sessionsPerUser: 2.5, avgSessionDuration: 19.2 },
          { date: '2024-03-01', dailyActiveUsers: 10100, sessionsPerUser: 2.7, avgSessionDuration: 20.1 },
        ],
        summary: {
          avgDailyActive: '9,267',
          avgSessionsPerUser: '2.5',
          avgSessionDuration: '19.3 min',
        },
      };
    }
    
    if (input.metric === 'retention') {
      return {
        metric: 'retention',
        period: input.period,
        data: {
          day1: 85.2,
          day7: 62.1,
          day30: 34.8,
          day90: 18.5,
        },
        cohortAnalysis: [
          { cohort: '2024-01', day1: 87.1, day7: 64.3, day30: 36.2 },
          { cohort: '2024-02', day1: 84.8, day7: 61.5, day30: 34.1 },
          { cohort: '2024-03', day1: 83.7, day7: 60.4, day30: 33.9 },
        ],
      };
    }
    
    if (input.metric === 'demographics') {
      return {
        metric: 'demographics',
        period: input.period,
        data: {
          userTypes: {
            'Artist': 35.2,
            'Producer': 28.7,
            'Listener': 36.1,
          },
          ageGroups: {
            '18-24': 32.1,
            '25-34': 41.3,
            '35-44': 18.7,
            '45+': 7.9,
          },
          topCountries: [
            { country: 'United States', percentage: 42.1 },
            { country: 'United Kingdom', percentage: 18.3 },
            { country: 'Canada', percentage: 12.7 },
            { country: 'Australia', percentage: 8.9 },
            { country: 'Germany', percentage: 6.2 },
          ],
        },
      };
    }

    return { error: 'Invalid metric' };
  });

export default userAnalyticsProcedure;