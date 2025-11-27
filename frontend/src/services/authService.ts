import { apiConfig } from '@/utils/config';
import { store } from '@/app/store';
import { loginSuccess, loginStart, loginFailure, logout as logoutAction } from '@/features/auth/authSlice';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  username: string;
  age: number;
  date_of_birth?: string; // Optional date of birth in YYYY-MM-DD format
  role: string;
}

export interface User {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'user' | 'guide' | 'admin';
  display_name: string;
  onboarding_completed: boolean;
  age?: number;
  date_of_birth?: string;
  is_active: boolean;
  date_joined: string;
  bio?: string;
  gender?: string;
  is_anonymous_preferred?: boolean;
  allow_peer_matching?: boolean;
  crisis_contact_phone?: string;
  last_mood_checkin?: string;
  notification_preferences?: Record<string, any>;
  professional_title?: string;
  license_number?: string;
  specializations?: string[];
  years_experience?: number;
  is_staff?: boolean;
  is_superuser?: boolean;
  last_active?: string;
  full_name?: string;
}

export interface AuthResponse {
  detail: string;
  token: {
    access: string;
    refresh: string;
  };
  user: User;
}

export interface ApiError {
  detail?: string;
  email?: string[];
  username?: string[];
  password?: string[];
  [key: string]: any;
}

class AuthService {
  private mockLogin(credentials: LoginCredentials): AuthResponse {
    const email = credentials.email.toLowerCase();
    const role = email.includes('admin') ? 'admin' : email.includes('guide') ? 'guide' : 'user';
    const now = new Date().toISOString();
    const user: User = {
      id: email,
      email,
      username: email.split('@')[0],
      first_name: role === 'admin' ? 'Admin' : role === 'guide' ? 'Guide' : 'User',
      last_name: 'Mock',
      role: role as User['role'],
      is_active: true,
      date_joined: now,
      onboarding_completed: true,
      display_name: role === 'admin' ? 'Administrator' : role === 'guide' ? 'Guide User' : 'Regular User',
    };
    return {
      detail: 'Mock login successful',
      token: { access: 'mock-access', refresh: 'mock-refresh' },
      user,
    };
  }
  private baseUrl = apiConfig.baseUrl;

  /**
   * Login user with email and password
   */
async login(credentials: LoginCredentials): Promise<AuthResponse> {
  const url = `${this.baseUrl}/accounts/login/`;
  
  // Dispatch login start action
  store.dispatch(loginStart());
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      let errorMessage = 'Login failed';
      if (response.status === 400 || response.status === 401) {
        errorMessage = data.detail || 'Invalid email or password';
      } else if (response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      // Dispatch login failure action
      store.dispatch(loginFailure(errorMessage));
      alert(errorMessage);
      throw new Error(errorMessage);
    }

    this.setTokens(data.token);
    this.setUser(data.user);
    
    // Dispatch login success action to sync Redux state
    store.dispatch(loginSuccess({
      user: data.user,
      token: data.token
    }));
    
    return data;
  } catch (err: any) {
    const errorMessage = err.message.includes('Failed to fetch') 
      ? 'Unable to reach API. Ensure backend is running or set VITE_API_URL.'
      : err.message || 'An unexpected error occurred during login.';
    
    // Dispatch login failure action
    store.dispatch(loginFailure(errorMessage));
    alert(errorMessage);
    throw err;
  }
}



  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<{ detail: string; user: any }> {
    const response = await fetch(`${this.baseUrl}/accounts/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error('Registration failed') as Error & { data: ApiError };
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/accounts/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Password reset request failed');
    }

    return data;
  }

  /**
   * Confirm password reset with token
   */
  async confirmPasswordReset(uid: string, token: string, newPassword: string): Promise<{ detail: string }> {
    const response = await fetch(`${this.baseUrl}/accounts/password-reset-confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uid,
        token,
        new_password: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Password reset failed');
    }

    return data;
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${this.baseUrl}/accounts/me/`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
        return this.getCurrentUser(); // Retry with new token
      }
      throw new Error('Failed to get user profile');
    }

    const user = await response.json();
    this.setUser(user);
    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseUrl}/accounts/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      // Refresh token is invalid, logout user
      this.logout();
      throw new Error('Session expired. Please login again.');
    }

    const data = await response.json();
    localStorage.setItem('access_token', data.access);
  }

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_user');
    
    // Dispatch logout action to sync Redux state
    store.dispatch(logoutAction());
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getUser();
    return !!(token && user);
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Get stored user data
   */
  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Store authentication tokens
   */
  private setTokens(tokens: { access: string; refresh: string }): void {
    localStorage.setItem('access_token', tokens.access);
    localStorage.setItem('refresh_token', tokens.refresh);
  }

  /**
   * Store user data
   */
  private setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  /**
   * Get authorization header for API requests
   */
  getAuthHeader(): { Authorization: string } | {} {
    const token = this.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  /**
   * Make authenticated API request
   */
  async authenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 401) {
      // Try to refresh token
      try {
        await this.refreshToken();
        // Retry request with new token
        return this.authenticatedRequest(url, options);
      } catch (error) {
        // Refresh failed, logout user
        this.logout();
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
