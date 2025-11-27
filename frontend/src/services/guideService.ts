import { apiClient } from './apiClient';
import { CrisisAlert } from './crisisService';

export interface Client {
  id: number;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'at_risk' | 'inactive';
  lastAssessment: string;
  riskLevel: 'low' | 'medium' | 'high';
  lastContact: string;
  assignedDate: string;
  phone?: string;
  emergency_contact?: string;
  notes?: string;
}

export interface AnalyticsData {
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  assessmentsThisWeek: number;
  interventionsThisMonth: number;
  clientEngagement: {
    high: number;
    medium: number;
    low: number;
  };
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  monthlyTrends: {
    month: string;
    assessments: number;
    interventions: number;
  }[];
  interventionSuccess: {
    successful: number;
    ongoing: number;
    needsEscalation: number;
  };
}

export interface ClientContact {
  id: number;
  client_id: number;
  contact_type: 'phone' | 'email' | 'in_person' | 'video';
  notes: string;
  timestamp: string;
  outcome: 'positive' | 'neutral' | 'concerning';
}

class GuideService {
  async getClients(): Promise<Client[]> {
    try {
      // Use the real accounts/clients endpoint
      console.log('Getting clients from /accounts/clients/');
      const response = await apiClient.get('/accounts/clients/');
      console.log('Guide clients response:', response);
      
      // Handle different response formats
      let clientData = response;
      if (response && typeof response === 'object' && 'data' in response) {
        clientData = response.data;
      }
      
      // Convert User objects to Client objects if needed
      if (Array.isArray(clientData)) {
        return clientData.map(user => ({
          id: user.id,
          name: user.display_name || `${user.first_name} ${user.last_name}` || user.username,
          email: user.email,
          age: user.age || 0,
          status: user.is_active ? 'active' : 'inactive',
          lastAssessment: user.last_active || user.date_joined,
          riskLevel: 'low', // Default since we don't have this data
          lastContact: user.last_active || user.date_joined,
          assignedDate: user.date_joined,
          phone: user.crisis_contact_phone,
          emergency_contact: user.crisis_contact_phone,
          notes: user.bio || ''
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      throw error;
    }
  }

  async getClient(clientId: number): Promise<Client> {
    try {
      // Use the real accounts endpoint since /guide/clients/ doesn't exist
      const response = await apiClient.get(`/accounts/admin/users/${clientId}/`);
      const user = response as any;
      
      // Convert User object to Client object
      return {
        id: user.id,
        name: user.display_name || `${user.first_name} ${user.last_name}` || user.username,
        email: user.email,
        age: user.age || 0,
        status: user.is_active ? 'active' : 'inactive',
        lastAssessment: user.last_active || user.date_joined,
        riskLevel: 'low',
        lastContact: user.last_active || user.date_joined,
        assignedDate: user.date_joined,
        phone: user.crisis_contact_phone,
        emergency_contact: user.crisis_contact_phone,
        notes: user.bio || ''
      };
    } catch (error) {
      console.error('Failed to fetch client:', error);
      throw error;
    }
  }

  async updateClient(clientId: number, updates: Partial<Client>): Promise<Client> {
    try {
      // Use the real accounts endpoint since /guide/clients/ doesn't exist
      const response = await apiClient.patch(`/accounts/admin/users/${clientId}/`, updates);
      const user = response as any;
      
      // Convert User object to Client object
      return {
        id: user.id,
        name: user.display_name || `${user.first_name} ${user.last_name}` || user.username,
        email: user.email,
        age: user.age || 0,
        status: user.is_active ? 'active' : 'inactive',
        lastAssessment: user.last_active || user.date_joined,
        riskLevel: 'low',
        lastContact: user.last_active || user.date_joined,
        assignedDate: user.date_joined,
        phone: user.crisis_contact_phone,
        emergency_contact: user.crisis_contact_phone,
        notes: user.bio || ''
      };
    } catch (error) {
      console.error('Failed to update client:', error);
      throw error;
    }
  }

  async getCrisisAlerts(): Promise<CrisisAlert[]> {
    try {
      // This endpoint doesn't exist in the backend yet
      console.warn('Crisis alerts endpoint not implemented in backend');
      return [];
    } catch (error) {
      console.error('Failed to fetch crisis alerts:', error);
      return [];
    }
  }

  async getAnalytics(timeRange: string = '30d'): Promise<AnalyticsData> {
    try {
      // This endpoint doesn't exist in the backend yet
      console.warn('Guide analytics endpoint not implemented in backend');
      return {
        totalClients: 0,
        activeClients: 0,
        atRiskClients: 0,
        assessmentsThisWeek: 0,
        interventionsThisMonth: 0,
        clientEngagement: { high: 0, medium: 0, low: 0 },
        riskDistribution: { low: 0, medium: 0, high: 0 },
        monthlyTrends: [],
        interventionSuccess: { successful: 0, ongoing: 0, needsEscalation: 0 }
      };
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      throw error;
    }
  }

  async contactClient(clientId: number, contactData: Omit<ClientContact, 'id' | 'timestamp'>): Promise<void> {
    try {
      await apiClient.post('/guide/client-contact/', {
        ...contactData,
        client_id: clientId,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log client contact:', error);
      throw error;
    }
  }

  async getClientContacts(clientId: number): Promise<ClientContact[]> {
    try {
      const response = await apiClient.get(`/guide/clients/${clientId}/contacts/`);
      return response as ClientContact[];
    } catch (error) {
      console.error('Failed to fetch client contacts:', error);
      throw error;
    }
  }

  async assignClient(clientId: number): Promise<void> {
    try {
      await apiClient.post(`/guide/clients/${clientId}/assign/`);
    } catch (error) {
      console.error('Failed to assign client:', error);
      throw error;
    }
  }

  async unassignClient(clientId: number, reason: string): Promise<void> {
    try {
      await apiClient.post(`/guide/clients/${clientId}/unassign/`, { reason });
    } catch (error) {
      console.error('Failed to unassign client:', error);
      throw error;
    }
  }

  async scheduleFollowUp(clientId: number, followUpDate: string, notes: string): Promise<void> {
    try {
      await apiClient.post('/guide/follow-ups/', {
        client_id: clientId,
        scheduled_date: followUpDate,
        notes: notes
      });
    } catch (error) {
      console.error('Failed to schedule follow-up:', error);
      throw error;
    }
  }

  async getFollowUps(): Promise<any[]> {
    try {
      // This endpoint doesn't exist in the backend yet
      console.warn('Follow-ups endpoint not implemented in backend');
      return [];
    } catch (error) {
      console.error('Failed to fetch follow-ups:', error);
      return [];
    }
  }
}

export const guideService = new GuideService();
