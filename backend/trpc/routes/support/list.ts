import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockSupportTickets } from '../../../database/mock-data';

const listSupportTicketsSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  category: z.enum(['Technical', 'Payment', 'Account', 'Content', 'Other']).optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const listSupportTicketsProcedure = requirePermission('support:view')
  .input(listSupportTicketsSchema)
  .query(async ({ input }) => {
    let filteredTickets = [...mockSupportTickets];

    // Apply filters
    if (input.status) {
      filteredTickets = filteredTickets.filter(ticket => ticket.status === input.status);
    }

    if (input.priority) {
      filteredTickets = filteredTickets.filter(ticket => ticket.priority === input.priority);
    }

    if (input.category) {
      filteredTickets = filteredTickets.filter(ticket => ticket.category === input.category);
    }

    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredTickets = filteredTickets.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.user_email.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort by created_at (newest first)
    filteredTickets.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    // Pagination
    const startIndex = (input.page - 1) * input.limit;
    const endIndex = startIndex + input.limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      pagination: {
        page: input.page,
        limit: input.limit,
        total: filteredTickets.length,
        totalPages: Math.ceil(filteredTickets.length / input.limit),
      },
      stats: {
        open: mockSupportTickets.filter(t => t.status === 'Open').length,
        inProgress: mockSupportTickets.filter(t => t.status === 'In Progress').length,
        resolved: mockSupportTickets.filter(t => t.status === 'Resolved').length,
        closed: mockSupportTickets.filter(t => t.status === 'Closed').length,
        high: mockSupportTickets.filter(t => t.priority === 'High').length,
      },
    };
  });

export default listSupportTicketsProcedure;