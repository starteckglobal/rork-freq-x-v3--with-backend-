import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockSupportTickets } from '../../../database/mock-data';

const updateTicketStatusSchema = z.object({
  ticketId: z.string(),
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']),
  assignedAgent: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTicketStatusProcedure = requirePermission('support:manage')
  .input(updateTicketStatusSchema)
  .mutation(async ({ input, ctx }) => {
    // Find the ticket
    const ticketIndex = mockSupportTickets.findIndex(ticket => ticket.id === input.ticketId);
    
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }

    // Update the ticket
    const ticket = mockSupportTickets[ticketIndex];
    ticket.status = input.status;
    ticket.updated_at = new Date();
    
    if (input.assignedAgent) {
      ticket.assigned_agent = input.assignedAgent;
    }

    // In a real app, you would also save notes to a separate table
    // and potentially send notifications to the user

    return {
      success: true,
      ticket: ticket,
      message: `Ticket status updated to ${input.status}`,
    };
  });

export default updateTicketStatusProcedure;