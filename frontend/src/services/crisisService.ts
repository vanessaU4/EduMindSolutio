import { apiClient } from './apiClient';

export interface SafetyPlanData {
  warning_signs: string[];
  coping_strategies: string[];
  support_people: { name: string; phone: string; relationship: string }[];
  professional_contacts: { name: string; phone: string; role: string }[];
  safe_environment: string[];
  reasons_to_live: string[];
  emergency_contacts: { name: string; phone: string }[];
}

export interface CrisisAlert {
  id: number;
  clientName: string;
  clientId: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'suicidal_ideation' | 'panic_attack' | 'self_harm' | 'substance_abuse' | 'other';
  description: string;
  timestamp: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo: string;
  lastAction: string;
  contactAttempts: number;
}

export interface CrisisResource {
  id: number;
  name: string;
  phone: string;
  description: string;
  available_24_7: boolean;
  type: 'hotline' | 'text' | 'chat' | 'emergency';
}

class CrisisService {
  async getSafetyPlan(): Promise<SafetyPlanData> {
    try {
      const response = await apiClient.get('/crisis/safety-plan/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch safety plan:', error);
      throw error;
    }
  }

  async updateSafetyPlan(plan: SafetyPlanData): Promise<void> {
    try {
      await apiClient.put('/crisis/safety-plan/', plan);
    } catch (error) {
      console.error('Failed to update safety plan:', error);
      throw error;
    }
  }

  async getCrisisAlerts(): Promise<CrisisAlert[]> {
    try {
      const response = await apiClient.get('/crisis/alerts/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crisis alerts:', error);
      throw error;
    }
  }

  async updateAlertStatus(alertId: number, status: string, notes?: string): Promise<void> {
    try {
      await apiClient.put(`/crisis/alerts/${alertId}/`, { status, notes });
    } catch (error) {
      console.error('Failed to update alert status:', error);
      throw error;
    }
  }

  async createCrisisAlert(alert: Omit<CrisisAlert, 'id' | 'timestamp'>): Promise<CrisisAlert> {
    try {
      const response = await apiClient.post('/crisis/alerts/', alert);
      return response.data;
    } catch (error) {
      console.error('Failed to create crisis alert:', error);
      throw error;
    }
  }

  async getCrisisResources(): Promise<CrisisResource[]> {
    try {
      const response = await apiClient.get('/crisis/resources/');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch crisis resources:', error);
      throw error;
    }
  }

  async contactClient(clientId: number, method: string, notes: string): Promise<void> {
    try {
      await apiClient.post('/crisis/contact-log/', {
        client_id: clientId,
        contact_method: method,
        notes: notes,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log client contact:', error);
      throw error;
    }
  }

  async escalateAlert(alertId: number, reason: string): Promise<void> {
    try {
      await apiClient.post(`/crisis/alerts/${alertId}/escalate/`, { reason });
    } catch (error) {
      console.error('Failed to escalate alert:', error);
      throw error;
    }
  }
}

export const crisisService = new CrisisService();
