import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('🔧 API Base URL configured as:', API_BASE_URL);
console.log('🔧 Environment VITE_API_URL:', import.meta.env.VITE_API_URL);

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  detail?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = authService.getAccessToken();

    const headers: HeadersInit = {
      ...options.headers,
    };

    // Only set Content-Type for JSON data, let browser set it for FormData
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Log warning when making authenticated requests without token
      console.warn(`API request to ${endpoint} made without authentication token`);
    }

    const doFetch = async (): Promise<Response> =>
      fetch(url, { ...options, headers });

    try {
      let response = await doFetch();

      // Handle 401 Unauthorized - try to refresh token
      if (response.status === 401 && token) {
        try {
          await authService.refreshToken();
          const newToken = authService.getAccessToken();
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
            response = await doFetch();
          }
        } catch (refreshError) {
          authService.logout();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Enhanced error logging for debugging
        console.error('🚨 API Request Failed:', {
          url,
          method: options.method || 'GET',
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestHeaders: headers,
          requestBody: options.body instanceof FormData ? 'FormData' : options.body
        });
        
        // Log errorData separately for easier inspection
        console.error('🔍 Django Error Details:', errorData);
        
        // If it's a FormData request, log the contents
        if (options.body instanceof FormData) {
          console.error('📋 FormData Contents:');
          for (let [key, value] of options.body.entries()) {
            if (value instanceof File) {
              console.error(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
              console.error(`  ${key}: ${value}`);
            }
          }
        }
        
        const error = new Error(errorData.detail || errorData.error || `HTTP error! status: ${response.status}`) as any;
        error.response = {
          status: response.status,
          statusText: response.statusText,
          data: errorData
        };
        throw error;
      }

      // Handle empty responses (like 204 No Content for DELETE operations)
      const contentType = response.headers.get('content-type');
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return {} as T;
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text) {
        return {} as T;
      }

      return JSON.parse(text);
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    console.log('🔄 ApiClient: PATCH request to:', `${this.baseUrl}${endpoint}`);
    console.log('🔄 ApiClient: Request data:', data);
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
