import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockUsers } from '../../../database/mock-data';

const exportUsersSchema = z.object({
  format: z.enum(['csv', 'json']).default('csv'),
  filter: z.enum(['Artist', 'Producer', 'Listener', 'All']).optional().default('All'),
  status: z.enum(['Active', 'Suspended', 'Banned', 'All']).optional().default('All'),
});

export const exportUsersProcedure = requirePermission('user_management:view')
  .input(exportUsersSchema)
  .mutation(async ({ input }) => {
    let filteredUsers = [...mockUsers];

    // Apply filters
    if (input.filter !== 'All') {
      filteredUsers = filteredUsers.filter(user => user.type === input.filter);
    }

    if (input.status !== 'All') {
      filteredUsers = filteredUsers.filter(user => user.status === input.status);
    }

    if (input.format === 'csv') {
      // Generate CSV
      const headers = ['ID', 'Name', 'Email', 'Type', 'Status', 'Joined Date', 'Track Count', 'Warning Count'];
      const csvRows = [
        headers.join(','),
        ...filteredUsers.map(user => [
          user.id,
          `\"${user.name}\"`,
          user.email,
          user.type,
          user.status,
          user.joined_date.toISOString().split('T')[0],
          user.track_count,
          user.warning_count,
        ].join(','))
      ];

      return {
        data: csvRows.join('\\n'),
        filename: `users_export_${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv',
      };
    } else {
      // Return JSON
      return {
        data: JSON.stringify(filteredUsers, null, 2),
        filename: `users_export_${new Date().toISOString().split('T')[0]}.json`,
        contentType: 'application/json',
      };
    }
  });

export default exportUsersProcedure;