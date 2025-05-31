import api from './api';

class SensorService {
  async getAllSensors(params = {}) {
    try {
      const response = await api.get('/sensors', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch sensors');
    }
  }

  async getSensor(id) {
    try {
      const response = await api.get(`/sensors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch sensor');
    }
  }

  async createSensor(sensorData) {
    try {
      const response = await api.post('/sensors', sensorData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create sensor');
    }
  }

  async updateSensor(id, sensorData) {
    try {
      const response = await api.put(`/sensors/${id}`, sensorData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update sensor');
    }
  }

  async deleteSensor(id) {
    try {
      const response = await api.delete(`/sensors/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete sensor');
    }
  }

  async getSensorReadings(id, params = {}) {
    try {
      const response = await api.get(`/sensors/${id}/readings`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch sensor readings');
    }
  }

  async submitSensorReading(id, readingData) {
    try {
      const response = await api.post(`/sensors/${id}/readings`, readingData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to submit sensor reading');
    }
  }

  async getSensorStatus() {
    try {
      const response = await api.get('/sensors/status');
      return response.data;
    } catch (error) {
      console.error('Error fetching sensor status:', error);

      // Return empty data instead of throwing error to prevent app crash
      if (error.response?.status === 401) {
        // Authentication error - let auth context handle it
        throw error;
      }

      // For other errors, return empty data with error flag
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to fetch sensor status'
      };
    }
  }

  async getSensorThresholds(id) {
    try {
      const response = await api.get(`/sensors/${id}/thresholds`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch sensor thresholds');
    }
  }

  async updateSensorThresholds(id, thresholds) {
    try {
      const response = await api.put(`/sensors/${id}/thresholds`, thresholds);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update sensor thresholds');
    }
  }

  // Utility methods for data processing
  formatSensorReading(reading) {
    return {
      ...reading,
      formattedValue: `${reading.value} ${reading.unit}`,
      formattedTime: new Date(reading.timestamp).toLocaleString(),
    };
  }

  getSensorStatusColor(status) {
    const statusColors = {
      active: 'green',
      inactive: 'gray',
      error: 'red',
      warning: 'yellow',
    };
    return statusColors[status] || 'gray';
  }

  getSensorTypeIcon(type) {
    const typeIcons = {
      temperature: '🌡️',
      humidity: '💧',
      air_quality: '🌬️',
      motion: '🚶',
      pressure: '📊',
      light: '💡',
    };
    return typeIcons[type] || '📡';
  }

  calculateSensorHealth(sensor) {
    const now = new Date();
    const lastReading = new Date(sensor.lastReading?.timestamp);
    const timeDiff = now - lastReading;
    const hoursOld = timeDiff / (1000 * 60 * 60);

    if (sensor.status === 'error') return 'critical';
    if (hoursOld > 24) return 'poor';
    if (hoursOld > 6) return 'fair';
    if (sensor.batteryLevel < 20) return 'warning';
    return 'good';
  }
}

export default new SensorService();
