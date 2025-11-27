import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface User {
  id: number | string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  role: "user" | "guide" | "admin";
  is_active: boolean;
  date_joined: string;
  onboarding_completed: boolean;
  display_name?: string;
  age?: number;
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
  last_active?: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  token: {
    access: string;
    refresh: string;
  } | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Note: Authentication is now handled by authService directly
// These async thunks are kept for potential future use but not currently used

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    clearError: (state) => {
      state.error = null;
    },
    loadUserFromStorage: (state) => {
      const storedUser = localStorage.getItem("user");
      const storedAccessToken = localStorage.getItem("access_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");

      if (storedUser && storedAccessToken && storedRefreshToken) {
        try {
          const user = JSON.parse(storedUser);
          state.user = user;
          state.token = {
            access: storedAccessToken,
            refresh: storedRefreshToken
          };
          state.isAuthenticated = true;
        } catch (err) {
          console.error("Failed to parse user from storage", err);
          localStorage.removeItem("user");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    },
  },
  // Note: extraReducers removed as authentication is handled by authService
});

export const { loginSuccess, loginStart, loginFailure, logout, clearError, loadUserFromStorage } = authSlice.actions;
export default authSlice.reducer;
