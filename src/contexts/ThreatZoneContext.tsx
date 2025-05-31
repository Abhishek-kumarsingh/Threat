"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import threatZoneService from "../services/threatZoneService";
import socketService from "../services/socketService";

type ThreatZone = {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "predicted";
  severity: "low" | "medium" | "high" | "critical";
  threatLevel: number;
  location: {
    id: string;
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  boundaries: {
    type: string;
    coordinates: number[][];
  };
  affectedAreas: string[];
  estimatedPopulation: number;
  evacuationRoutes: Array<{
    id: string;
    name: string;
    description: string;
    waypoints?: Array<{ lat: number; lng: number }>;
    estimatedTime?: string;
    capacity?: number;
  }>;
  predictionModel?: {
    algorithm: string;
    confidence: number;
    factors: string[];
    inputData?: any;
  };
  relatedAlerts?: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
};

type ThreatZoneContextType = {
  threatZones: ThreatZone[];
  activeThreatZones: ThreatZone[];
  locationHistory: { [locationId: string]: any[] };
  loading: boolean;
  error: string | null;
  fetchThreatZones: (params?: any) => Promise<void>;
  getThreatZone: (id: string) => Promise<ThreatZone>;
  createThreatZone: (zoneData: any) => Promise<void>;
  updateThreatZone: (id: string, zoneData: any) => Promise<void>;
  deleteThreatZone: (id: string) => Promise<void>;
  deactivateThreatZone: (id: string, reason: string, notes?: string) => Promise<void>;
  getActiveThreatZones: () => Promise<void>;
  getLocationThreatZones: (locationId: string) => Promise<void>;
  generatePrediction: (predictionData: any) => Promise<any>;
  getLocationHistory: (locationId: string, params?: any) => Promise<void>;
  runAllPredictions: (modelType?: string, timeHorizon?: string) => Promise<void>;
};

const ThreatZoneContext = createContext<ThreatZoneContextType | undefined>(undefined);

export const ThreatZoneProvider = ({ children }: { children: React.ReactNode }) => {
  const [threatZones, setThreatZones] = useState<ThreatZone[]>([]);
  const [activeThreatZones, setActiveThreatZones] = useState<ThreatZone[]>([]);
  const [locationHistory, setLocationHistory] = useState<{ [locationId: string]: any[] }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchThreatZones = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await threatZoneService.getAllThreatZones(params);
      setThreatZones(response.data);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to fetch threat zones:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getThreatZone = async (id: string) => {
    try {
      const response = await threatZoneService.getThreatZone(id);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createThreatZone = async (zoneData: any) => {
    try {
      const response = await threatZoneService.createThreatZone(zoneData);
      setThreatZones(prev => [response.data, ...prev]);
      if (response.data.status === 'active') {
        setActiveThreatZones(prev => [response.data, ...prev]);
      }
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateThreatZone = async (id: string, zoneData: any) => {
    try {
      const response = await threatZoneService.updateThreatZone(id, zoneData);
      setThreatZones(prev => prev.map(zone => 
        zone.id === id ? { ...zone, ...response.data } : zone
      ));
      setActiveThreatZones(prev => prev.map(zone => 
        zone.id === id ? { ...zone, ...response.data } : zone
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteThreatZone = async (id: string) => {
    try {
      await threatZoneService.deleteThreatZone(id);
      setThreatZones(prev => prev.filter(zone => zone.id !== id));
      setActiveThreatZones(prev => prev.filter(zone => zone.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deactivateThreatZone = async (id: string, reason: string, notes = '') => {
    try {
      const response = await threatZoneService.deactivateThreatZone(id, reason, notes);
      setThreatZones(prev => prev.map(zone => 
        zone.id === id ? { ...zone, ...response.data } : zone
      ));
      setActiveThreatZones(prev => prev.filter(zone => zone.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const getActiveThreatZones = async () => {
    try {
      const response = await threatZoneService.getActiveThreatZones();

      // Handle both success and error responses
      if (response.success === false) {
        console.warn('Failed to fetch active threat zones:', response.error);
        setActiveThreatZones([]);
        setError(response.error);
        return;
      }

      setActiveThreatZones(response.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error in getActiveThreatZones:', error);
      setActiveThreatZones([]);
      setError(error.message);
      // Don't re-throw auth errors to prevent infinite loops
      if (error.response?.status !== 401) {
        // Only throw non-auth errors
        return;
      }
      throw error;
    }
  };

  const getLocationThreatZones = async (locationId: string) => {
    try {
      const response = await threatZoneService.getLocationThreatZones(locationId);
      // Update active threat zones for this location
      setActiveThreatZones(prev => {
        const filtered = prev.filter(zone => zone.location.id !== locationId);
        return [...filtered, ...response.data];
      });
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const generatePrediction = async (predictionData: any) => {
    try {
      const response = await threatZoneService.generatePrediction(predictionData);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const getLocationHistory = async (locationId: string, params = {}) => {
    try {
      const response = await threatZoneService.getLocationHistory(locationId, params);
      setLocationHistory(prev => ({
        ...prev,
        [locationId]: response.data
      }));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const runAllPredictions = async (modelType = 'ml_ensemble', timeHorizon = '6h') => {
    try {
      await threatZoneService.runAllPredictions(modelType, timeHorizon);
      // Refresh threat zones after predictions
      await fetchThreatZones();
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // WebSocket event handlers
  useEffect(() => {
    const handleThreatZoneCreated = (data: ThreatZone) => {
      setThreatZones(prev => [data, ...prev]);
      if (data.status === 'active') {
        setActiveThreatZones(prev => [data, ...prev]);
      }
    };

    const handleThreatZoneUpdated = (data: ThreatZone) => {
      setThreatZones(prev => prev.map(zone => 
        zone.id === data.id ? { ...zone, ...data } : zone
      ));
      
      if (data.status === 'active') {
        setActiveThreatZones(prev => {
          const existing = prev.find(zone => zone.id === data.id);
          if (existing) {
            return prev.map(zone => zone.id === data.id ? { ...zone, ...data } : zone);
          } else {
            return [data, ...prev];
          }
        });
      } else {
        setActiveThreatZones(prev => prev.filter(zone => zone.id !== data.id));
      }
    };

    // Subscribe to WebSocket events
    socketService.subscribe('threat_zone_created', handleThreatZoneCreated);
    socketService.subscribe('threat_zone_updated', handleThreatZoneUpdated);

    return () => {
      socketService.unsubscribe('threat_zone_created', handleThreatZoneCreated);
      socketService.unsubscribe('threat_zone_updated', handleThreatZoneUpdated);
    };
  }, []);

  useEffect(() => {
    fetchThreatZones();
    getActiveThreatZones();
  }, [fetchThreatZones]);

  return (
    <ThreatZoneContext.Provider value={{
      threatZones,
      activeThreatZones,
      locationHistory,
      loading,
      error,
      fetchThreatZones,
      getThreatZone,
      createThreatZone,
      updateThreatZone,
      deleteThreatZone,
      deactivateThreatZone,
      getActiveThreatZones,
      getLocationThreatZones,
      generatePrediction,
      getLocationHistory,
      runAllPredictions
    }}>
      {children}
    </ThreatZoneContext.Provider>
  );
};

export const useThreatZones = () => {
  const context = useContext(ThreatZoneContext);
  if (context === undefined) {
    throw new Error("useThreatZones must be used within a ThreatZoneProvider");
  }
  return context;
};
