// Database Schema Definitions for FREQ Moderator Dashboard
// In production, these would be actual database tables

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'Artist' | 'Producer' | 'Listener';
  status: 'Active' | 'Suspended' | 'Banned';
  joined_date: Date;
  track_count: number;
  warning_count: number;
  payment_info: any;
  created_at: Date;
  updated_at: Date;
}

export interface Track {
  id: string;
  title: string;
  artist_id: string;
  file_url: string;
  duration: number;
  genre: string;
  status: 'pending' | 'approved' | 'rejected';
  uploaded_at: Date;
  reviewed_at?: Date;
  reviewer_id?: string;
}

export interface ContentReview {
  id: string;
  track_id: string;
  reason: string;
  priority: 'High' | 'Medium' | 'Low';
  flags: string[];
  created_at: Date;
  resolved_at?: Date;
}

export interface Report {
  id: string;
  type: 'Copyright' | 'Inappropriate Content' | 'Spam' | 'Other';
  reported_content_id: string;
  reported_user_id: string;
  reporter_email: string;
  description: string;
  severity: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
  assigned_moderator?: string;
  resolution_notes?: string;
  created_at: Date;
  resolved_at?: Date;
}

export interface Payment {
  id: string;
  artist_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'disputed';
  payment_method: string;
  transaction_id: string;
  failure_reason?: string;
  processed_at?: Date;
  created_at: Date;
}

export interface PaymentDispute {
  id: string;
  payment_id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved';
  resolution?: string;
  created_at: Date;
}

export interface SupportTicket {
  id: string;
  user_email: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  assigned_agent?: string;
  category: string;
  created_at: Date;
  updated_at: Date;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_type: 'user' | 'agent';
  sender_id: string;
  message: string;
  attachments: string[];
  created_at: Date;
}

export interface PlatformStats {
  id: string;
  date: Date;
  metric_type: string;
  metric_value: number;
  additional_data: any;
}

export interface UserAnalytics {
  user_id: string;
  date: Date;
  streams: number;
  revenue: number;
  new_followers: number;
}

export interface SyncOpportunity {
  id: string;
  title: string;
  description: string;
  brand: string;
  budget_range: string;
  genre_preferences: string[];
  deadline: Date;
  status: 'active' | 'closed' | 'draft';
  requirements: string;
  contact_info: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface SyncApplication {
  id: string;
  sync_opportunity_id: string;
  artist_id: string;
  track_id: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  submitted_at: Date;
  reviewed_at?: Date;
  reviewer_notes?: string;
}