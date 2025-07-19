// Mock data for development - In production, this would come from a real database
import { User, Track, Report, Payment, SupportTicket, SyncOpportunity } from './schema';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Producer',
    email: 'john@example.com',
    type: 'Producer',
    status: 'Active',
    joined_date: new Date('2024-01-15'),
    track_count: 25,
    warning_count: 0,
    payment_info: { stripe_id: 'cus_123' },
    created_at: new Date('2024-01-15'),
    updated_at: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Artist',
    email: 'sarah@example.com',
    type: 'Artist',
    status: 'Active',
    joined_date: new Date('2024-02-01'),
    track_count: 12,
    warning_count: 1,
    payment_info: { stripe_id: 'cus_456' },
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'Mike Listener',
    email: 'mike@example.com',
    type: 'Listener',
    status: 'Suspended',
    joined_date: new Date('2024-01-20'),
    track_count: 0,
    warning_count: 3,
    payment_info: {},
    created_at: new Date('2024-01-20'),
    updated_at: new Date('2024-03-01'),
  },
];

export const mockTracks: Track[] = [
  {
    id: '1',
    title: 'Summer Vibes',
    artist_id: '1',
    file_url: 'https://example.com/track1.mp3',
    duration: 180,
    genre: 'Electronic',
    status: 'pending',
    uploaded_at: new Date('2024-03-01'),
  },
  {
    id: '2',
    title: 'Night Drive',
    artist_id: '2',
    file_url: 'https://example.com/track2.mp3',
    duration: 240,
    genre: 'Synthwave',
    status: 'approved',
    uploaded_at: new Date('2024-02-28'),
    reviewed_at: new Date('2024-03-01'),
    reviewer_id: '1',
  },
];

export const mockReports: Report[] = [
  {
    id: '1',
    type: 'Copyright',
    reported_content_id: '1',
    reported_user_id: '2',
    reporter_email: 'reporter@example.com',
    description: 'This track contains copyrighted material',
    severity: 'High',
    status: 'Open',
    created_at: new Date('2024-03-01'),
  },
  {
    id: '2',
    type: 'Inappropriate Content',
    reported_content_id: '2',
    reported_user_id: '1',
    reporter_email: 'another@example.com',
    description: 'Explicit content not marked appropriately',
    severity: 'Medium',
    status: 'Investigating',
    assigned_moderator: '1',
    created_at: new Date('2024-02-28'),
  },
];

export const mockPayments: Payment[] = [
  {
    id: '1',
    artist_id: '1',
    amount: 150.00,
    currency: 'USD',
    status: 'completed',
    payment_method: 'stripe',
    transaction_id: 'txn_123',
    processed_at: new Date('2024-02-28'),
    created_at: new Date('2024-02-25'),
  },
  {
    id: '2',
    artist_id: '2',
    amount: 75.50,
    currency: 'USD',
    status: 'pending',
    payment_method: 'paypal',
    transaction_id: 'txn_456',
    created_at: new Date('2024-03-01'),
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: '1',
    user_email: 'user@example.com',
    subject: 'Cannot upload tracks',
    description: 'I am getting an error when trying to upload my music',
    priority: 'Medium',
    status: 'Open',
    category: 'Technical',
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-03-01'),
  },
  {
    id: '2',
    user_email: 'artist@example.com',
    subject: 'Payment not received',
    description: 'My payment from last month has not arrived',
    priority: 'High',
    status: 'In Progress',
    assigned_agent: '1',
    category: 'Payment',
    created_at: new Date('2024-02-28'),
    updated_at: new Date('2024-03-01'),
  },
];

export const mockSyncOpportunities: SyncOpportunity[] = [
  {
    id: '1',
    title: 'Nike Commercial Campaign',
    description: 'Looking for energetic electronic music for new sneaker campaign',
    brand: 'Nike',
    budget_range: '$5,000 - $15,000',
    genre_preferences: ['Electronic', 'Hip-Hop', 'Pop'],
    deadline: new Date('2024-04-15'),
    status: 'active',
    requirements: 'High energy, 30-60 seconds, instrumental preferred',
    contact_info: 'sync@nike.com',
    created_by: '1',
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-03-01'),
  },
  {
    id: '2',
    title: 'Netflix Series Soundtrack',
    description: 'Indie folk songs needed for upcoming drama series',
    brand: 'Netflix',
    budget_range: '$2,000 - $8,000',
    genre_preferences: ['Folk', 'Indie', 'Alternative'],
    deadline: new Date('2024-05-01'),
    status: 'active',
    requirements: 'Emotional, storytelling lyrics, full songs',
    contact_info: 'music@netflix.com',
    created_by: '1',
    created_at: new Date('2024-02-28'),
    updated_at: new Date('2024-02-28'),
  },
];

// Analytics mock data
export const mockAnalytics = {
  overview: {
    totalUsers: 15420,
    activeUsers: 12350,
    totalTracks: 45230,
    pendingReviews: 127,
    openTickets: 23,
    monthlyRevenue: 125000,
  },
  userGrowth: [
    { date: '2024-01-01', users: 10000 },
    { date: '2024-02-01', users: 12000 },
    { date: '2024-03-01', users: 15420 },
  ],
  revenueData: [
    { date: '2024-01-01', revenue: 95000 },
    { date: '2024-02-01', revenue: 110000 },
    { date: '2024-03-01', revenue: 125000 },
  ],
};