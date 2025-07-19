import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { LinearGradient } from 'expo-linear-gradient';
import {
  MessageSquare,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Home,
  ArrowLeft,
} from 'lucide-react-native';

interface SupportTicket {
  id: string;
  user_email: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  category: 'Technical' | 'Payment' | 'Account' | 'Content' | 'Other';
  assigned_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export default function SupportTicketsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Mock data for support tickets
  const mockTickets: SupportTicket[] = [
    {
      id: '1',
      user_email: 'user@example.com',
      subject: 'Cannot upload tracks',
      description: 'I am getting an error when trying to upload my music files. The upload fails at 50%.',
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
      description: 'My payment from last month has not arrived in my account. Transaction ID: TXN123456',
      priority: 'High',
      status: 'In Progress',
      assigned_agent: 'Agent Smith',
      category: 'Payment',
      created_at: new Date('2024-02-28'),
      updated_at: new Date('2024-03-01'),
    },
    {
      id: '3',
      user_email: 'producer@example.com',
      subject: 'Account verification issue',
      description: 'Unable to verify my producer account. Documents were submitted but status shows pending.',
      priority: 'Low',
      status: 'Resolved',
      assigned_agent: 'Agent Johnson',
      category: 'Account',
      created_at: new Date('2024-02-25'),
      updated_at: new Date('2024-02-27'),
    },
    {
      id: '4',
      user_email: 'listener@example.com',
      subject: 'App crashes on startup',
      description: 'The app crashes immediately when I try to open it on my Android device.',
      priority: 'Critical',
      status: 'Open',
      category: 'Technical',
      created_at: new Date('2024-03-02'),
      updated_at: new Date('2024-03-02'),
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ticket.user_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleTicketPress = (ticket: SupportTicket) => {
    Alert.alert(
      ticket.subject,
      `From: ${ticket.user_email}\n\nDescription: ${ticket.description}\n\nPriority: ${ticket.priority}\nStatus: ${ticket.status}\nCategory: ${ticket.category}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Assign to Me', 
          onPress: () => {
            Alert.alert('Success', 'Ticket assigned to you');
          }
        },
        { 
          text: 'Update Status', 
          onPress: () => {
            Alert.alert(
              'Update Status',
              'Choose new status:',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'In Progress', onPress: () => Alert.alert('Success', 'Status updated to In Progress') },
                { text: 'Resolved', onPress: () => Alert.alert('Success', 'Status updated to Resolved') },
                { text: 'Closed', onPress: () => Alert.alert('Success', 'Status updated to Closed') },
              ]
            );
          }
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return '#EF4444';
      case 'High': return '#F59E0B';
      case 'Medium': return '#06B6D4';
      case 'Low': return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return '#EF4444';
      case 'In Progress': return '#F59E0B';
      case 'Resolved': return '#10B981';
      case 'Closed': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Open': return AlertTriangle;
      case 'In Progress': return Clock;
      case 'Resolved': return CheckCircle;
      case 'Closed': return XCircle;
      default: return MessageSquare;
    }
  };

  const TicketCard = ({ ticket }: { ticket: SupportTicket }) => {
    const StatusIcon = getStatusIcon(ticket.status);
    
    return (
      <TouchableOpacity 
        style={styles.ticketCard}
        onPress={() => handleTicketPress(ticket)}
      >
        <View style={styles.ticketHeader}>
          <View style={styles.ticketInfo}>
            <Text style={styles.ticketSubject} numberOfLines={1}>
              {ticket.subject}
            </Text>
            <Text style={styles.ticketEmail}>{ticket.user_email}</Text>
          </View>
          <View style={styles.ticketMeta}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(ticket.priority) + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor(ticket.priority) }]}>
                {ticket.priority}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.ticketDescription} numberOfLines={2}>
          {ticket.description}
        </Text>
        
        <View style={styles.ticketFooter}>
          <View style={styles.statusContainer}>
            <StatusIcon size={16} color={getStatusColor(ticket.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(ticket.status) }]}>
              {ticket.status}
            </Text>
          </View>
          <Text style={styles.categoryText}>{ticket.category}</Text>
          <Text style={styles.dateText}>
            {ticket.created_at.toLocaleDateString()}
          </Text>
        </View>
        
        {ticket.assigned_agent && (
          <View style={styles.assignedAgent}>
            <User size={14} color="#8B5CF6" />
            <Text style={styles.agentText}>{ticket.assigned_agent}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ 
        headerShown: true,
        title: 'Support Tickets',
        headerStyle: { backgroundColor: '#000000' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { color: '#FFFFFF', fontWeight: '600' },
        headerLeft: () => (
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.headerButton}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Return to FREQ',
                'Are you sure you want to return to the main app?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Yes', onPress: () => router.push('/(tabs)') }
                ]
              );
            }}
            style={styles.headerButton}
          >
            <LinearGradient
              colors={['#8B5CF6', '#06B6D4']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.freqLogo}
            >
              <Text style={styles.freqLogoText}>FREQ</Text>
            </LinearGradient>
          </TouchableOpacity>
        ),
      }} />
      
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tickets..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.filtersContainer}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Alert.alert(
                  'Filter by Status',
                  'Choose status:',
                  [
                    { text: 'All', onPress: () => setSelectedStatus('all') },
                    { text: 'Open', onPress: () => setSelectedStatus('Open') },
                    { text: 'In Progress', onPress: () => setSelectedStatus('In Progress') },
                    { text: 'Resolved', onPress: () => setSelectedStatus('Resolved') },
                    { text: 'Closed', onPress: () => setSelectedStatus('Closed') },
                  ]
                );
              }}
            >
              <Filter size={16} color="#8B5CF6" />
              <Text style={styles.filterText}>
                {selectedStatus === 'all' ? 'All Status' : selectedStatus}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Alert.alert(
                  'Filter by Priority',
                  'Choose priority:',
                  [
                    { text: 'All', onPress: () => setSelectedPriority('all') },
                    { text: 'Critical', onPress: () => setSelectedPriority('Critical') },
                    { text: 'High', onPress: () => setSelectedPriority('High') },
                    { text: 'Medium', onPress: () => setSelectedPriority('Medium') },
                    { text: 'Low', onPress: () => setSelectedPriority('Low') },
                  ]
                );
              }}
            >
              <Filter size={16} color="#8B5CF6" />
              <Text style={styles.filterText}>
                {selectedPriority === 'all' ? 'All Priority' : selectedPriority}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTickets.filter(t => t.status === 'Open').length}</Text>
            <Text style={styles.statLabel}>Open</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTickets.filter(t => t.status === 'In Progress').length}</Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTickets.filter(t => t.priority === 'Critical').length}</Text>
            <Text style={styles.statLabel}>Critical</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{mockTickets.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>

        {/* Tickets List */}
        <View style={styles.ticketsSection}>
          <Text style={styles.sectionTitle}>
            Support Tickets ({filteredTickets.length})
          </Text>
          
          {filteredTickets.length === 0 ? (
            <View style={styles.emptyState}>
              <MessageSquare size={48} color="#6B7280" />
              <Text style={styles.emptyStateText}>No tickets found</Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || selectedStatus !== 'all' || selectedPriority !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'All tickets have been resolved'
                }
              </Text>
            </View>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerButton: {
    padding: 8,
  },
  freqLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqLogoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  searchSection: {
    padding: 16,
    backgroundColor: '#1F2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  ticketsSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  ticketCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  ticketInfo: {
    flex: 1,
    marginRight: 12,
  },
  ticketSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ticketEmail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  ticketMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 12,
    lineHeight: 20,
  },
  ticketFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dateText: {
    fontSize: 12,
    color: '#6B7280',
  },
  assignedAgent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    gap: 6,
  },
  agentText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});