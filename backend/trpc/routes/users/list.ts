import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockUsers } from '../../../database/mock-data';

const listUsersSchema = z.object({
  filter: z.enum(['Artist', 'Producer', 'Listener', 'All']).optional().default('All'),
  status: z.enum(['Active', 'Suspended', 'Banned', 'All']).optional().default('All'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
  search: z.string().optional(),
});

export const listUsersProcedure = requirePermission('user_management:view')
  .input(listUsersSchema)
  .query(async ({ input }) => {
    let filteredUsers = [...mockUsers];

    // Filter by type
    if (input.filter !== 'All') {
      filteredUsers = filteredUsers.filter(user => user.type === input.filter);
    }

    // Filter by status
    if (input.status !== 'All') {
      filteredUsers = filteredUsers.filter(user => user.status === input.status);
    }

    // Search filter
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const total = filteredUsers.length;
    const users = filteredUsers.slice(input.offset, input.offset + input.limit);

    return {
      users,
      total,
      hasMore: input.offset + input.limit < total,
    };
  });

export default listUsersProcedure;