import { z } from 'zod';
import { requirePermission } from '../../create-context';
import { mockTracks, mockUsers } from '../../../database/mock-data';

const pendingContentSchema = z.object({
  priority: z.enum(['High', 'Medium', 'Low', 'All']).optional().default('All'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0),
});

export const pendingContentProcedure = requirePermission('content_moderation:approve')
  .input(pendingContentSchema)
  .query(async ({ input }) => {
    // Get pending tracks
    let pendingTracks = mockTracks.filter(track => track.status === 'pending');

    // In a real implementation, you would join with priority data
    // For now, we'll simulate priority based on upload date (newer = higher priority)
    const tracksWithPriority = pendingTracks.map(track => {
      const daysSinceUpload = Math.floor((Date.now() - track.uploaded_at.getTime()) / (1000 * 60 * 60 * 24));
      let priority: 'High' | 'Medium' | 'Low';
      
      if (daysSinceUpload > 7) priority = 'High';
      else if (daysSinceUpload > 3) priority = 'Medium';
      else priority = 'Low';

      const artist = mockUsers.find(u => u.id === track.artist_id);

      return {
        ...track,
        priority,
        artist_name: artist?.name || 'Unknown Artist',
        artist_email: artist?.email || '',
        days_pending: daysSinceUpload,
      };
    });

    // Filter by priority
    let filteredTracks = tracksWithPriority;
    if (input.priority !== 'All') {
      filteredTracks = tracksWithPriority.filter(track => track.priority === input.priority);
    }

    // Sort by priority (High first) then by upload date (oldest first)
    filteredTracks.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return a.uploaded_at.getTime() - b.uploaded_at.getTime();
    });

    // Pagination
    const total = filteredTracks.length;
    const tracks = filteredTracks.slice(input.offset, input.offset + input.limit);

    return {
      tracks,
      total,
      hasMore: input.offset + input.limit < total,
    };
  });

export default pendingContentProcedure;