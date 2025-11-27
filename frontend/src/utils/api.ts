/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || "http://localhost:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const storedToken = localStorage.getItem("token");
  if (storedToken) {
    try {
      const token = JSON.parse(storedToken);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.warn(
          "Token object or access property is missing/invalid:",
          token
        );
      }
    } catch (e) {
      localStorage.removeItem("token");
    }
  }
  return config;
});

// Mental Health Platform Types
export interface Review {
  id: number;
  username: string;
  user_email: string;
  user_role: "user" | "guide" | "admin";
  comment: string;
  sentiment: "positive" | "negative" | "neutral";
  rating: number;
  source_url: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Pagination wrapper for list responses
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Authentication types
export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "user" | "guide" | "admin";
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  detail: string;
  token: {
    access: string;
    refresh: string;
  };
  user: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    role: "user" | "guide" | "admin";
  };
}

export interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "user" | "guide" | "admin";
  is_active: boolean;
  date_joined: string;
}

// Dashboard Stats interfaces
export interface DashboardStats {
  total_reviews: number;
  average_rating: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  total_users: number;
  total_assessments: number;
  total_posts: number;
}

export interface SentimentTrend {
  month: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface CategoryStat {
  category: number;
  positive: number;
  negative: number;
  neutral: number;
}

// API Service Functions
export const apiService = {
  // Authentication
  register: (data: RegisterRequest) =>
    api.post<{ detail: string; user: User }>("/accounts/register/", data),
  login: (data: LoginRequest) =>
    api.post<AuthResponse>("/accounts/login/", data),
  refreshToken: (refresh: string) =>
    api.post("/accounts/token/refresh/", { refresh }),
  getUsers: () => api.get<User[]>("/accounts/users/"),

  // Reviews & Assessments
  getReviews: (params?: {
    user_role?: "user" | "guide" | "admin";
    sentiment?: "positive" | "negative" | "neutral";
    rating?: number;
    search?: string;
    page?: number;
  }) => api.get<PaginatedResponse<Review>>("/assessments/reviews/", { params }),
  createReview: (data: {
    comment: string;
    sentiment: "positive" | "negative" | "neutral";
    rating: number;
    source_url?: string;
  }) => api.post<{ message: string; review: Review }>("/assessments/reviews/", data),
  updateReview: (id: number, data: Partial<Review>) =>
    api.patch<Review>(`/assessments/reviews/${id}/`, data),
  deleteReview: (id: number) => api.delete(`/assessments/reviews/${id}/`),
  getMyReviews: () => api.get<Review[]>("/assessments/my-reviews/"),
  getReviewsByRole: (role: "user" | "guide" | "admin") =>
    api.get<Review[]>(`/assessments/reviews/role/${role}/`),
  getReviewStats: () => api.get("/assessments/reviews/stats/"),

  // Admin Dashboard APIs
  getSentimentOverview: () => api.get("/assessments/sentiment/overview/"),
  getSentimentTrends: (params?: { period?: string }) =>
    api.get("/assessments/sentiment/trends/", { params }),
  getCategoryStats: () => api.get("/assessments/sentiment/category/"),

  // Health Monitoring
  getHealth: () => api.get("/health/"),
  getDetailedHealth: () => api.get("/health/detailed/"),
};

export default api;
