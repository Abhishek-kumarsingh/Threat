import api from './api';

class DashboardService {
  async getDashboardSummary() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch dashboard summary');
    }
  }

  async getUserDashboard() {
    try {
      const response = await api.get('/dashboard/user');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch user dashboard');
    }
  }

  async getRecentActivity() {
    try {
      const response = await api.get('/dashboard/activity');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch recent activity');
    }
  }

  async getLocationOverview(locationId) {
    try {
      const response = await api.get(`/dashboard/locations/${locationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch location overview');
    }
  }

  // Utility methods for dashboard data processing
  formatDashboardData(data) {
    return {
      ...data,
      formattedLastUpdate: new Date(data.lastUpdate).toLocaleString(),
      alertSummary: this.formatAlertSummary(data.alerts),
      sensorSummary: this.formatSensorSummary(data.sensors),
      threatSummary: this.formatThreatSummary(data.threatZones),
    };
  }

  formatAlertSummary(alerts) {
    const summary = {
      total: alerts?.length || 0,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    if (alerts) {
      alerts.forEach(alert => {
        summary[alert.status]++;
        summary[alert.severity]++;
      });
    }

    return summary;
  }

  formatSensorSummary(sensors) {
    const summary = {
      total: sensors?.length || 0,
      online: 0,
      offline: 0,
      warning: 0,
      critical: 0,
      batteryLow: 0,
      maintenanceDue: 0,
    };

    if (sensors) {
      sensors.forEach(sensor => {
        summary[sensor.status]++;
        if (sensor.batteryLevel < 20) summary.batteryLow++;
        if (sensor.maintenanceDue) summary.maintenanceDue++;
      });
    }

    return summary;
  }

  formatThreatSummary(threatZones) {
    const summary = {
      total: threatZones?.length || 0,
      active: 0,
      inactive: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      avgThreatLevel: 0,
    };

    if (threatZones && threatZones.length > 0) {
      let totalThreatLevel = 0;
      
      threatZones.forEach(zone => {
        if (zone.isActive) summary.active++;
        else summary.inactive++;
        
        if (zone.threatLevel >= 8) summary.critical++;
        else if (zone.threatLevel >= 6) summary.high++;
        else if (zone.threatLevel >= 4) summary.medium++;
        else summary.low++;
        
        totalThreatLevel += zone.threatLevel;
      });
      
      summary.avgThreatLevel = totalThreatLevel / threatZones.length;
    }

    return summary;
  }

  getSystemStatus(data) {
    const { alerts, sensors, threatZones } = data;
    
    // Check for critical conditions
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'active') || [];
    const offlineSensors = sensors?.filter(s => s.status === 'offline') || [];
    const criticalZones = threatZones?.filter(z => z.isActive && z.threatLevel >= 8) || [];
    
    if (criticalAlerts.length > 0 || criticalZones.length > 0) {
      return 'critical';
    }
    
    if (offlineSensors.length > sensors?.length * 0.2) {
      return 'warning';
    }
    
    const warningAlerts = alerts?.filter(a => a.severity === 'high' && a.status === 'active') || [];
    if (warningAlerts.length > 0) {
      return 'warning';
    }
    
    return 'normal';
  }

  getStatusColor(status) {
    const statusColors = {
      normal: 'green',
      warning: 'yellow',
      critical: 'red',
    };
    return statusColors[status] || 'gray';
  }

  calculateResponseTime(alerts) {
    if (!alerts || alerts.length === 0) return 0;
    
    const acknowledgedAlerts = alerts.filter(a => a.acknowledgedAt);
    if (acknowledgedAlerts.length === 0) return 0;
    
    const totalResponseTime = acknowledgedAlerts.reduce((total, alert) => {
      const responseTime = new Date(alert.acknowledgedAt) - new Date(alert.createdAt);
      return total + responseTime;
    }, 0);
    
    return totalResponseTime / acknowledgedAlerts.length / (1000 * 60); // Return in minutes
  }

  calculateResolutionTime(alerts) {
    if (!alerts || alerts.length === 0) return 0;
    
    const resolvedAlerts = alerts.filter(a => a.resolvedAt);
    if (resolvedAlerts.length === 0) return 0;
    
    const totalResolutionTime = resolvedAlerts.reduce((total, alert) => {
      const resolutionTime = new Date(alert.resolvedAt) - new Date(alert.createdAt);
      return total + resolutionTime;
    }, 0);
    
    return totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60); // Return in hours
  }

  getPerformanceMetrics(data) {
    const { alerts, sensors } = data;
    
    return {
      avgResponseTime: this.calculateResponseTime(alerts),
      avgResolutionTime: this.calculateResolutionTime(alerts),
      sensorUptime: this.calculateSensorUptime(sensors),
      systemReliability: this.calculateSystemReliability(data),
    };
  }

  calculateSensorUptime(sensors) {
    if (!sensors || sensors.length === 0) return 100;
    
    const onlineSensors = sensors.filter(s => s.status === 'online').length;
    return (onlineSensors / sensors.length) * 100;
  }

  calculateSystemReliability(data) {
    const { alerts, sensors, threatZones } = data;
    
    let score = 100;
    
    // Deduct points for active critical alerts
    const criticalAlerts = alerts?.filter(a => a.severity === 'critical' && a.status === 'active') || [];
    score -= criticalAlerts.length * 20;
    
    // Deduct points for offline sensors
    const offlineSensors = sensors?.filter(s => s.status === 'offline') || [];
    const sensorReliability = sensors?.length > 0 ? (sensors.length - offlineSensors.length) / sensors.length : 1;
    score *= sensorReliability;
    
    // Deduct points for high threat zones
    const highThreatZones = threatZones?.filter(z => z.isActive && z.threatLevel >= 6) || [];
    score -= highThreatZones.length * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  getRecommendations(data) {
    const recommendations = [];
    const { alerts, sensors, threatZones } = data;
    
    // Alert recommendations
    const unacknowledgedAlerts = alerts?.filter(a => a.status === 'active') || [];
    if (unacknowledgedAlerts.length > 0) {
      recommendations.push({
        type: 'alert',
        priority: 'high',
        message: `${unacknowledgedAlerts.length} unacknowledged alerts require attention`,
        action: 'Review and acknowledge alerts',
      });
    }
    
    // Sensor recommendations
    const offlineSensors = sensors?.filter(s => s.status === 'offline') || [];
    if (offlineSensors.length > 0) {
      recommendations.push({
        type: 'sensor',
        priority: 'medium',
        message: `${offlineSensors.length} sensors are offline`,
        action: 'Check sensor connectivity and power',
      });
    }
    
    const lowBatterySensors = sensors?.filter(s => s.batteryLevel < 20) || [];
    if (lowBatterySensors.length > 0) {
      recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        message: `${lowBatterySensors.length} sensors have low battery`,
        action: 'Schedule battery replacement',
      });
    }
    
    // Threat zone recommendations
    const activeThreatZones = threatZones?.filter(z => z.isActive && z.threatLevel >= 6) || [];
    if (activeThreatZones.length > 0) {
      recommendations.push({
        type: 'threat',
        priority: 'high',
        message: `${activeThreatZones.length} high-threat zones detected`,
        action: 'Review evacuation procedures and alert personnel',
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  generateChartData(data, timeRange = '24h') {
    // This would generate chart data based on the time range
    // Implementation would depend on the specific chart requirements
    return {
      alertTrends: this.generateAlertTrendData(data.alerts, timeRange),
      sensorReadings: this.generateSensorReadingData(data.sensors, timeRange),
      threatLevels: this.generateThreatLevelData(data.threatZones, timeRange),
    };
  }

  generateAlertTrendData(alerts, timeRange) {
    // Generate time-series data for alert trends
    // This is a simplified implementation
    const now = new Date();
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 720;
    const data = [];
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourAlerts = alerts?.filter(alert => {
        const alertTime = new Date(alert.createdAt);
        return alertTime >= time && alertTime < new Date(time.getTime() + 60 * 60 * 1000);
      }) || [];
      
      data.push({
        time: time.toISOString(),
        count: hourAlerts.length,
        critical: hourAlerts.filter(a => a.severity === 'critical').length,
        high: hourAlerts.filter(a => a.severity === 'high').length,
      });
    }
    
    return data;
  }

  generateSensorReadingData(sensors, timeRange) {
    // Generate sensor reading trends
    // This would typically come from the backend with actual reading data
    return sensors?.map(sensor => ({
      sensorId: sensor._id,
      name: sensor.name,
      type: sensor.type,
      currentValue: sensor.lastReading?.value || 0,
      trend: 'stable', // This would be calculated from historical data
    })) || [];
  }

  generateThreatLevelData(threatZones, timeRange) {
    // Generate threat level trends
    return threatZones?.map(zone => ({
      zoneId: zone._id,
      name: zone.name,
      currentLevel: zone.threatLevel,
      trend: zone.trend || 'stable',
      isActive: zone.isActive,
    })) || [];
  }
}

export default new DashboardService();
