import api from './api';

class AdminService {
  async getDashboardSummary() {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch admin dashboard');
    }
  }

  async getUserStats() {
    try {
      const response = await api.get('/admin/user-stats');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user statistics');
    }
  }

  async getRecentActivity() {
    try {
      const response = await api.get('/admin/recent-activity');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch recent activity');
    }
  }

  async getSystemHealth() {
    try {
      const response = await api.get('/admin/system-health');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch system health');
    }
  }

  async runMaintenance(maintenanceType) {
    try {
      const response = await api.post('/admin/maintenance', { type: maintenanceType });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to run maintenance');
    }
  }

  async getAuditLogs(params = {}) {
    try {
      const response = await api.get('/admin/audit-logs', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch audit logs');
    }
  }

  async createBackup(backupType = 'full') {
    try {
      const response = await api.post('/admin/backup', { type: backupType });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create backup');
    }
  }

  // User management methods
  async getAllUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch users');
    }
  }

  async getUser(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user');
    }
  }

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create user');
    }
  }

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update user');
    }
  }

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete user');
    }
  }

  async assignUserLocations(userId, locationIds) {
    try {
      const response = await api.post(`/users/${userId}/locations`, { locationIds });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to assign locations');
    }
  }

  async getUserLocations(userId) {
    try {
      const response = await api.get(`/users/${userId}/locations`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user locations');
    }
  }

  async getUserNotifications(userId, params = {}) {
    try {
      const response = await api.get(`/users/${userId}/notifications`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user notifications');
    }
  }

  async updateUserPreferences(userId, preferences) {
    try {
      const response = await api.put(`/users/${userId}/preferences`, preferences);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update user preferences');
    }
  }

  // Utility methods
  formatSystemHealth(health) {
    return {
      ...health,
      uptimeFormatted: this.formatUptime(health.uptime),
      cpuUsageFormatted: `${health.cpuUsage}%`,
      memoryUsageFormatted: `${health.memoryUsage}%`,
      diskUsageFormatted: `${health.diskUsage}%`,
    };
  }

  formatUptime(uptime) {
    const days = Math.floor(uptime / (24 * 60 * 60));
    const hours = Math.floor((uptime % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((uptime % (60 * 60)) / 60);
    
    return `${days}d ${hours}h ${minutes}m`;
  }

  getHealthStatus(metrics) {
    const { cpuUsage, memoryUsage, diskUsage } = metrics;
    
    if (cpuUsage > 90 || memoryUsage > 90 || diskUsage > 95) {
      return 'critical';
    }
    if (cpuUsage > 75 || memoryUsage > 75 || diskUsage > 85) {
      return 'warning';
    }
    return 'healthy';
  }

  getHealthColor(status) {
    const statusColors = {
      healthy: 'green',
      warning: 'yellow',
      critical: 'red',
    };
    return statusColors[status] || 'gray';
  }

  formatAuditLog(log) {
    return {
      ...log,
      formattedTime: new Date(log.timestamp).toLocaleString(),
      actionDescription: this.getActionDescription(log.action, log.resource),
    };
  }

  getActionDescription(action, resource) {
    const descriptions = {
      create: `Created ${resource}`,
      update: `Updated ${resource}`,
      delete: `Deleted ${resource}`,
      login: 'User logged in',
      logout: 'User logged out',
      export: `Exported ${resource}`,
      import: `Imported ${resource}`,
    };
    return descriptions[action] || `${action} ${resource}`;
  }

  calculateSystemScore(metrics) {
    const { cpuUsage, memoryUsage, diskUsage, errorRate } = metrics;
    
    const cpuScore = Math.max(0, 100 - cpuUsage);
    const memoryScore = Math.max(0, 100 - memoryUsage);
    const diskScore = Math.max(0, 100 - diskUsage);
    const errorScore = Math.max(0, 100 - (errorRate * 100));
    
    return Math.round((cpuScore + memoryScore + diskScore + errorScore) / 4);
  }

  getMaintenanceRecommendations(systemHealth) {
    const recommendations = [];
    
    if (systemHealth.cpuUsage > 80) {
      recommendations.push('Consider scaling CPU resources');
    }
    if (systemHealth.memoryUsage > 80) {
      recommendations.push('Memory usage is high - consider cleanup');
    }
    if (systemHealth.diskUsage > 85) {
      recommendations.push('Disk space is running low - cleanup required');
    }
    if (systemHealth.errorRate > 0.05) {
      recommendations.push('Error rate is elevated - investigate logs');
    }
    
    return recommendations;
  }
}

export default new AdminService();
