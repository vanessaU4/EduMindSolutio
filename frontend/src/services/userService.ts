import { apiClient } from './apiClient';

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: 'user' | 'guide' | 'admin';
  age?: number;
  gender?: string;
  bio?: string;
  avatar?: string;
  is_anonymous_preferred: boolean;
  allow_peer_matching: boolean;
  crisis_contact_phone?: string;
  onboarding_completed: boolean;
  last_mood_checkin?: string;
  notification_preferences: Record<string, any>;
  professional_title?: string;
  license_number?: string;
  specializations?: string[];
  years_experience?: number;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  last_active: string;
  display_name: string;
  full_name: string;
}

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  age?: number;
  gender?: string;
  bio?: string;
  is_anonymous_preferred?: boolean;
  allow_peer_matching?: boolean;
  crisis_contact_phone?: string;
  notification_preferences?: Record<string, any>;
  professional_title?: string;
  license_number?: string;
  specializations?: string[];
  years_experience?: number;
}

export interface OnboardingData {
  age: number;
  gender?: string;
  bio?: string;
  is_anonymous_preferred?: boolean;
  allow_peer_matching?: boolean;
  crisis_contact_phone?: string;
}

class UserService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/accounts/me/');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserData): Promise<User> {
    console.log('🔄 UserService: Updating profile with data:', data);
    console.log('🔄 UserService: API endpoint will be: /accounts/profile/');
    try {
      const result = await apiClient.patch<User>('/accounts/profile/', data);
      console.log('✅ UserService: Profile update successful:', result);
      return result;
    } catch (error: any) {
      console.error('❌ UserService: Profile update failed:', error);
      throw error;
    }
  }

  /**
   * Complete onboarding
   */
  async completeOnboarding(data: OnboardingData): Promise<User> {
    return apiClient.post<User>('/accounts/onboarding/', data);
  }

  /**
   * Update mood check-in
   */
  async updateMoodCheckin(): Promise<{ detail: string; last_mood_checkin: string }> {
    return apiClient.post('/accounts/mood-checkin/');
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      // Try admin endpoint first (requires admin role)
      console.log('Trying admin endpoint: /accounts/admin/users/');
      const adminResult = await apiClient.get<User[]>('/accounts/admin/users/');
      console.log('Admin endpoint result:', adminResult);
      return adminResult;
    } catch (error: any) {
      console.log('Admin endpoint error:', error.response?.status, error.message);
      
      // If admin endpoint fails, try regular users endpoint (requires guide role)
      if (error.response?.status === 403 || error.response?.status === 401) {
        console.warn('Admin endpoint failed, trying regular users endpoint: /accounts/users/');
        try {
          const userResult = await apiClient.get<User[]>('/accounts/users/');
          console.log('Users endpoint result:', userResult);
          return userResult;
        } catch (userError: any) {
          console.error('Users endpoint also failed:', userError.response?.status, userError.message);
          throw userError;
        }
      }
      throw error;
    }
  }

  /**
   * Get all clients (users with role 'user') - for guides and admins
   */
  async getClients(): Promise<User[]> {
    try {
      // Use the dedicated clients endpoint instead of admin endpoint
      console.log('Trying clients endpoint: /accounts/clients/');
      const clientsResult = await apiClient.get('/accounts/clients/');
      console.log('Clients endpoint result:', clientsResult);
      
      // Handle different response structures
      if (Array.isArray(clientsResult)) {
        return clientsResult;
      } else if (clientsResult && typeof clientsResult === 'object') {
        // Check for common pagination patterns
        const response = clientsResult as any;
        const users = response.results || response.data || response.users || [];
        return Array.isArray(users) ? users : [];
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch clients:', error.response?.status, error.message);
      return [];
    }
  }

  /**
   * Get all guides - for admins and guides
   */
  async getGuides(): Promise<User[]> {
    try {
      // Try to get all users first (this will use fallback logic)
      const allUsers = await this.getAllUsers();
      
      // Ensure allUsers is an array before filtering
      const usersArray = Array.isArray(allUsers) ? allUsers : [];
      const guides = usersArray.filter(user => user.role === 'guide');
      
      console.log('getAllUsers returned:', allUsers);
      console.log('Filtered guides:', guides);
      
      return guides;
    } catch (error) {
      console.error('Failed to fetch guides via getAllUsers, trying direct approach:', error);
      
      // Fallback: try to get from regular users endpoint and filter
      try {
        const directUsers = await apiClient.get<User[]>('/accounts/users/');
        const usersArray = Array.isArray(directUsers) ? directUsers : [];
        return usersArray.filter(user => user.role === 'guide');
      } catch (directError) {
        console.error('Direct users endpoint also failed:', directError);
        return [];
      }
    }
  }

  /**
   * Get specific user (admin only)
   */
  async getUser(id: number): Promise<User> {
    return apiClient.get<User>(`/accounts/admin/users/${id}/`);
  }

  /**
   * Update user (admin only)
   */
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return apiClient.patch<User>(`/accounts/admin/users/${id}/`, data);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: number): Promise<void> {
    return apiClient.delete<void>(`/accounts/admin/users/${id}/`);
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(id: number): Promise<User> {
    return apiClient.patch<User>(`/accounts/admin/users/${id}/`, { is_active: false });
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(id: number): Promise<User> {
    return apiClient.patch<User>(`/accounts/admin/users/${id}/`, { is_active: true });
  }

  /**
   * Change user role (admin only)
   */
  async changeUserRole(id: number, role: 'user' | 'guide' | 'admin'): Promise<User> {
    return apiClient.patch<User>(`/accounts/admin/users/${id}/`, { role });
  }

  /**
   * Create new user (admin only)
   */
  async createUser(data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    role: 'user' | 'guide' | 'admin';
    age?: number;
    gender?: string;
    bio?: string;
  }): Promise<User> {
    return apiClient.post<User>('/accounts/admin/users/', data);
  }

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(id: number, newPassword: string): Promise<void> {
    return apiClient.post<void>(`/accounts/users/${id}/reset-password/`, { password: newPassword });
  }
}

export const userService = new UserService();
export default userService;
