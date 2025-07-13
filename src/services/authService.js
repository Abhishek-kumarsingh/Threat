import api from '../../lib/axios';

class AuthService {
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      const { token, refreshToken, user } = data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user, token };
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  async register(userData) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      return await response.json();
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  async logout() {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/updatedetails', userData);
      const user = response.data.user;
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/updatepassword', passwordData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to change password');
    }
  }

  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgotpassword', { email });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token, password) {
    try {
      const response = await api.put(`/auth/resetpassword/${token}`, { password });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await api.put('/auth/preferences', preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update preferences');
    }
  }

  async registerWebPush(subscription) {
    try {
      const response = await api.post('/auth/webpush', { subscription });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to register push notifications');
    }
  }

  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  hasRole(role) {
    const user = this.getStoredUser();
    return user?.role === role;
  }

  hasPermission(permission) {
    const user = this.getStoredUser();
    return user?.permissions?.includes(permission) || false;
  }
}

export default new AuthService();
