"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import sensorService from "../services/sensorService";
import socketService from "../services/socketService";

type Sensor = {
  id: string;
  name: string;
  type: string;
  description?: string;
  location: {
    id: string;
    name: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: "active" | "inactive" | "error";
  lastReading?: {
    value: number;
    unit: string;
    timestamp: string;
    quality: string;
  };
  thresholds: {
    min: number;
    max: number;
    critical_min: number;
    critical_max: number;
  };
  batteryLevel?: number;
  configuration?: {
    readingInterval: number;
    transmissionInterval: number;
    calibrationOffset: number;
  };
  createdAt: string;
  updatedAt: string;
};

type SensorReading = {
  id: string;
  sensorId: string;
  value: number;
  unit: string;
  timestamp: string;
  quality: string;
};

type SensorContextType = {
  sensors: Sensor[];
  sensorReadings: { [sensorId: string]: SensorReading[] };
  sensorStatus: any;
  loading: boolean;
  error: string | null;
  fetchSensors: (params?: any) => Promise<void>;
  getSensor: (id: string) => Promise<Sensor>;
  createSensor: (sensorData: any) => Promise<void>;
  updateSensor: (id: string, sensorData: any) => Promise<void>;
  deleteSensor: (id: string) => Promise<void>;
  getSensorReadings: (id: string, params?: any) => Promise<void>;
  submitSensorReading: (id: string, readingData: any) => Promise<void>;
  getSensorThresholds: (id: string) => Promise<any>;
  updateSensorThresholds: (id: string, thresholds: any) => Promise<void>;
  fetchSensorStatus: () => Promise<void>;
};

const SensorContext = createContext<SensorContextType | undefined>(undefined);

export const SensorProvider = ({ children }: { children: React.ReactNode }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [sensorReadings, setSensorReadings] = useState<{ [sensorId: string]: SensorReading[] }>({});
  const [sensorStatus, setSensorStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await sensorService.getAllSensors(params);
      setSensors(response.data);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to fetch sensors:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getSensor = async (id: string) => {
    try {
      const response = await sensorService.getSensor(id);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const createSensor = async (sensorData: any) => {
    try {
      const response = await sensorService.createSensor(sensorData);
      setSensors(prev => [response.data, ...prev]);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateSensor = async (id: string, sensorData: any) => {
    try {
      const response = await sensorService.updateSensor(id, sensorData);
      setSensors(prev => prev.map(sensor => 
        sensor.id === id ? { ...sensor, ...response.data } : sensor
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteSensor = async (id: string) => {
    try {
      await sensorService.deleteSensor(id);
      setSensors(prev => prev.filter(sensor => sensor.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const getSensorReadings = async (id: string, params = {}) => {
    try {
      const response = await sensorService.getSensorReadings(id, params);
      setSensorReadings(prev => ({
        ...prev,
        [id]: response.data
      }));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const submitSensorReading = async (id: string, readingData: any) => {
    try {
      const response = await sensorService.submitSensorReading(id, readingData);
      // Update the sensor's last reading
      setSensors(prev => prev.map(sensor => 
        sensor.id === id ? { 
          ...sensor, 
          lastReading: response.data 
        } : sensor
      ));
      
      // Add to readings array
      setSensorReadings(prev => ({
        ...prev,
        [id]: [response.data, ...(prev[id] || [])]
      }));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const getSensorThresholds = async (id: string) => {
    try {
      const response = await sensorService.getSensorThresholds(id);
      return response.data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateSensorThresholds = async (id: string, thresholds: any) => {
    try {
      const response = await sensorService.updateSensorThresholds(id, thresholds);
      setSensors(prev => prev.map(sensor => 
        sensor.id === id ? { 
          ...sensor, 
          thresholds: response.data.thresholds 
        } : sensor
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const fetchSensorStatus = async () => {
    try {
      const response = await sensorService.getSensorStatus();

      // Handle both success and error responses
      if (response.success === false) {
        console.warn('Failed to fetch sensor status:', response.error);
        setSensorStatus([]);
        setError(response.error);
        return;
      }

      setSensorStatus(response.data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error in fetchSensorStatus:', error);
      setSensorStatus([]);
      setError(error.message);
      // Don't re-throw auth errors to prevent infinite loops
      if (error.response?.status !== 401) {
        return;
      }
      throw error;
    }
  };

  // WebSocket event handlers
  useEffect(() => {
    const handleSensorReading = (data: any) => {
      // Update sensor's last reading
      setSensors(prev => prev.map(sensor => 
        sensor.id === data.sensorId ? { 
          ...sensor, 
          lastReading: {
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp,
            quality: data.quality || 'good'
          }
        } : sensor
      ));

      // Add to readings array
      setSensorReadings(prev => ({
        ...prev,
        [data.sensorId]: [data, ...(prev[data.sensorId] || []).slice(0, 99)] // Keep last 100 readings
      }));
    };

    // Subscribe to WebSocket events
    socketService.subscribe('sensor_reading', handleSensorReading);

    return () => {
      socketService.unsubscribe('sensor_reading', handleSensorReading);
    };
  }, []);

  useEffect(() => {
    fetchSensors();
    fetchSensorStatus();
  }, [fetchSensors]);

  return (
    <SensorContext.Provider value={{
      sensors,
      sensorReadings,
      sensorStatus,
      loading,
      error,
      fetchSensors,
      getSensor,
      createSensor,
      updateSensor,
      deleteSensor,
      getSensorReadings,
      submitSensorReading,
      getSensorThresholds,
      updateSensorThresholds,
      fetchSensorStatus
    }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensors = () => {
  const context = useContext(SensorContext);
  if (context === undefined) {
    throw new Error("useSensors must be used within a SensorProvider");
  }
  return context;
};
