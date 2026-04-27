import axiosInstance from '../utils/axiosInstance';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8086';

export const getRoleDashboardPath = (role) => {
  if (role === 'ADMIN') return '/admin';
  if (role === 'TECHNICIAN') return '/dashboard/technician';
  return '/home';
};

const authService = {
  /**
   * Returns the Google OAuth2 authorization URL.
   * Redirecting to this URL initiates the Google login flow.
   */
  getGoogleLoginUrl() {
    return `${BACKEND_URL}/oauth2/authorization/google`;
  },

  async loginWithEmail(payload) {
    const response = await axiosInstance.post('/api/auth/login', payload);
    return response.data;
  },

  async signup(payload) {
    const response = await axiosInstance.post('/api/auth/signup', payload);
    return response.data;
  },

  async forgotPassword(payload) {
    const response = await axiosInstance.post('/api/auth/forgot-password', payload);
    return response.data;
  },

  async resetPassword(payload) {
    const response = await axiosInstance.post('/api/auth/reset-password', payload);
    return response.data;
  },

  /**
   * Fetches the currently authenticated user's info.
   * Used to validate the JWT token on app load.
   */
  async getCurrentUser() {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  /**
   * Logs out the current user on the server side.
   * Frontend must also clear the token from localStorage.
   */
  async logout() {
    await axiosInstance.post('/api/auth/logout');
  },

  async updateProfile(payload) {
    const response = await axiosInstance.put('/api/auth/me/profile', payload);
    return response.data;
  },

  async updateNotificationSettings(payload) {
    const response = await axiosInstance.put('/api/auth/me/notification-settings', payload);
    return response.data;
  },
};

export default authService;
