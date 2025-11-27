import { apiClient } from './apiClient';

export interface DebugInfo {
  current_user: {
    id: number;
    email: string;
    role: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
  permissions: {
    can_see_admin_users: boolean;
    can_moderate: boolean;
    is_guide: boolean;
  };
  database_stats: {
    total_users: number;
    admin_users: number;
    guide_users: number;
    regular_users: number;
    active_users: number;
  };
}

class DebugService {
  /**
   * Get debug information about current user and system
   */
  async getDebugInfo(): Promise<DebugInfo> {
    return apiClient.get<DebugInfo>('/accounts/debug/');
  }

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await fetch('/api/accounts/debug/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        return {
          status: 'connected',
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          status: `error_${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        status: 'connection_failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

export const debugService = new DebugService();
