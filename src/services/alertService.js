import api from './api';

class AlertService {
  async getAllAlerts(params = {}) {
    try {
      const response = await api.get('/alerts', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch alerts');
    }
  }

  async getAlert(id) {
    try {
      const response = await api.get(`/alerts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch alert');
    }
  }

  async createAlert(alertData) {
    try {
      const response = await api.post('/alerts', alertData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create alert');
    }
  }

  async updateAlert(id, alertData) {
    try {
      const response = await api.put(`/alerts/${id}`, alertData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update alert');
    }
  }

  async deleteAlert(id) {
    try {
      const response = await api.delete(`/alerts/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete alert');
    }
  }

  async acknowledgeAlert(id, notes = '') {
    try {
      const response = await api.put(`/alerts/${id}/acknowledge`, { notes });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to acknowledge alert');
    }
  }

  async resolveAlert(id, resolution, notes = '') {
    try {
      const response = await api.put(`/alerts/${id}/resolve`, { resolution, notes });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to resolve alert');
    }
  }

  async getActiveAlerts() {
    try {
      const response = await api.get('/alerts/active');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active alerts');
    }
  }

  async sendTestAlert(testData) {
    try {
      const response = await api.post('/alerts/test', testData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to send test alert');
    }
  }

  // Utility methods
  getSeverityColor(severity) {
    const severityColors = {
      low: 'blue',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return severityColors[severity] || 'gray';
  }

  getSeverityIcon(severity) {
    const severityIcons = {
      low: 'ℹ️',
      medium: '⚠️',
      high: '🔶',
      critical: '🚨',
    };
    return severityIcons[severity] || '📢';
  }

  getStatusColor(status) {
    const statusColors = {
      active: 'red',
      acknowledged: 'yellow',
      resolved: 'green',
    };
    return statusColors[status] || 'gray';
  }

  formatAlertTime(timestamp) {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now - alertTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  shouldEscalate(alert) {
    const now = new Date();
    const createdTime = new Date(alert.createdAt);
    const hoursOld = (now - createdTime) / (1000 * 60 * 60);

    // Escalation rules based on severity
    const escalationRules = {
      critical: 0.5, // 30 minutes
      high: 2,       // 2 hours
      medium: 8,     // 8 hours
      low: 24,       // 24 hours
    };

    return hoursOld > (escalationRules[alert.severity] || 24);
  }

  groupAlertsByLocation(alerts) {
    return alerts.reduce((groups, alert) => {
      const locationName = alert.location?.name || 'Unknown Location';
      if (!groups[locationName]) {
        groups[locationName] = [];
      }
      groups[locationName].push(alert);
      return groups;
    }, {});
  }

  getAlertPriority(alert) {
    const severityWeight = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1,
    };

    const statusWeight = {
      active: 3,
      acknowledged: 2,
      resolved: 1,
    };

    return (severityWeight[alert.severity] || 1) * (statusWeight[alert.status] || 1);
  }
}

export default new AlertService();
