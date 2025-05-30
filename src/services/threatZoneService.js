import api from './api';

class ThreatZoneService {
  async getAllThreatZones(params = {}) {
    try {
      const response = await api.get('/threat-zones', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch threat zones');
    }
  }

  async getThreatZone(id) {
    try {
      const response = await api.get(`/threat-zones/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch threat zone');
    }
  }

  async createThreatZone(zoneData) {
    try {
      const response = await api.post('/threat-zones', zoneData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to create threat zone');
    }
  }

  async updateThreatZone(id, zoneData) {
    try {
      const response = await api.put(`/threat-zones/${id}`, zoneData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to update threat zone');
    }
  }

  async deleteThreatZone(id) {
    try {
      const response = await api.delete(`/threat-zones/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to delete threat zone');
    }
  }

  async deactivateThreatZone(id, reason, notes = '') {
    try {
      const response = await api.put(`/threat-zones/${id}/deactivate`, { reason, notes });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to deactivate threat zone');
    }
  }

  async getActiveThreatZones() {
    try {
      const response = await api.get('/threat-zones/active');
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch active threat zones');
    }
  }

  async getLocationThreatZones(locationId) {
    try {
      const response = await api.get(`/threat-zones/locations/${locationId}/active`);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch location threat zones');
    }
  }

  async generatePrediction(predictionData) {
    try {
      const response = await api.post('/threat-zones/predict', predictionData);
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to generate prediction');
    }
  }

  async getLocationHistory(locationId, params = {}) {
    try {
      const response = await api.get(`/threat-zones/locations/${locationId}/history`, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch location history');
    }
  }

  async runAllPredictions(modelType = 'ml_ensemble', timeHorizon = '6h') {
    try {
      const response = await api.post('/threat-zones/predict-all', { modelType, timeHorizon });
      return response.data;
    } catch (error) {
      throw new Error(error.message || 'Failed to run predictions');
    }
  }

  // Utility methods
  getThreatLevelColor(threatLevel) {
    if (threatLevel >= 8) return 'red';
    if (threatLevel >= 6) return 'orange';
    if (threatLevel >= 4) return 'yellow';
    if (threatLevel >= 2) return 'blue';
    return 'green';
  }

  getSeverityColor(severity) {
    const severityColors = {
      low: 'green',
      medium: 'yellow',
      high: 'orange',
      critical: 'red',
    };
    return severityColors[severity] || 'gray';
  }

  formatThreatLevel(threatLevel) {
    return `${threatLevel.toFixed(1)}/10`;
  }

  calculateZoneArea(boundaries) {
    if (!boundaries?.coordinates || boundaries.coordinates.length < 3) {
      return 0;
    }

    // Simple polygon area calculation (Shoelace formula)
    const coords = boundaries.coordinates;
    let area = 0;
    
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      area += coords[i][0] * coords[j][1];
      area -= coords[j][0] * coords[i][1];
    }
    
    return Math.abs(area) / 2;
  }

  isPointInZone(point, zone) {
    if (!zone.boundaries?.coordinates) return false;
    
    const { lat, lng } = point;
    const coords = zone.boundaries.coordinates;
    let inside = false;

    for (let i = 0, j = coords.length - 1; i < coords.length; j = i++) {
      if (((coords[i][1] > lng) !== (coords[j][1] > lng)) &&
          (lat < (coords[j][0] - coords[i][0]) * (lng - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])) {
        inside = !inside;
      }
    }

    return inside;
  }

  getEvacuationTime(zone, population) {
    // Estimate evacuation time based on zone size and population
    const baseTime = 5; // 5 minutes base time
    const populationFactor = Math.log(population || 1) * 2;
    const areaFactor = this.calculateZoneArea(zone.boundaries) * 0.1;
    
    return Math.max(baseTime, baseTime + populationFactor + areaFactor);
  }

  getZoneStatus(zone) {
    const now = new Date();
    const expiresAt = new Date(zone.expiresAt);
    
    if (zone.status === 'inactive') return 'inactive';
    if (now > expiresAt) return 'expired';
    if (zone.threatLevel >= 8) return 'critical';
    if (zone.threatLevel >= 6) return 'high';
    return 'active';
  }

  formatPredictionConfidence(confidence) {
    return `${(confidence * 100).toFixed(1)}%`;
  }

  getRecommendedActions(zone) {
    const actions = [];
    
    if (zone.threatLevel >= 8) {
      actions.push('Immediate evacuation required');
      actions.push('Contact emergency services');
    } else if (zone.threatLevel >= 6) {
      actions.push('Prepare for potential evacuation');
      actions.push('Monitor situation closely');
    } else if (zone.threatLevel >= 4) {
      actions.push('Increase monitoring');
      actions.push('Alert personnel in area');
    }
    
    return actions;
  }
}

export default new ThreatZoneService();
