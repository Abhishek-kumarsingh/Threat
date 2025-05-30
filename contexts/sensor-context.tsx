"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWebSocket } from "./websocket-context";

type SensorData = {
  value: number;
  timestamp: Date;
};

type Sensor = {
  id: string;
  name: string;
  type: string;
  location: {
    lat: number;
    lng: number;
    description: string;
  };
  status: "online" | "offline" | "maintenance";
  currentValue: number;
  unit: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  history: SensorData[];
};

type SensorContextType = {
  sensors: Sensor[];
  loading: boolean;
  error: string | null;
  fetchSensors: () => Promise<void>;
  getSensor: (id: string) => Sensor | undefined;
  updateSensor: (id: string, data: Partial<Sensor>) => Promise<void>;
  createSensor: (sensor: Omit<Sensor, "id" | "history">) => Promise<void>;
  deleteSensor: (id: string) => Promise<void>;
  updateThresholds: (id: string, warning: number, critical: number) => Promise<void>;
};

const SensorContext = createContext<SensorContextType | undefined>(undefined);

// Mock sensor data
const mockSensors: Sensor[] = [
  {
    id: "1",
    name: "Air Quality Monitor 1",
    type: "air-quality",
    location: {
      lat: 40.7128,
      lng: -74.006,
      description: "Downtown"
    },
    status: "online",
    currentValue: 42,
    unit: "AQI",
    thresholds: {
      warning: 50,
      critical: 100
    },
    history: Array.from({ length: 24 }, (_, i) => ({
      value: 35 + Math.random() * 20,
      timestamp: new Date(Date.now() - i * 3600000)
    }))
  },
  {
    id: "2",
    name: "Temperature Sensor 1",
    type: "temperature",
    location: {
      lat: 40.7138,
      lng: -74.016,
      description: "City Park"
    },
    status: "online",
    currentValue: 22.5,
    unit: "°C",
    thresholds: {
      warning: 30,
      critical: 35
    },
    history: Array.from({ length: 24 }, (_, i) => ({
      value: 20 + Math.random() * 5,
      timestamp: new Date(Date.now() - i * 3600000)
    }))
  },
  {
    id: "3",
    name: "Water Quality Monitor 1",
    type: "water-quality",
    location: {
      lat: 40.7148,
      lng: -74.026,
      description: "River"
    },
    status: "maintenance",
    currentValue: 78,
    unit: "WQI",
    thresholds: {
      warning: 60,
      critical: 40
    },
    history: Array.from({ length: 24 }, (_, i) => ({
      value: 70 + Math.random() * 15,
      timestamp: new Date(Date.now() - i * 3600000)
    }))
  }
];

export const SensorProvider = ({ children }: { children: React.ReactNode }) => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket();

  // Initial fetch of sensors
  useEffect(() => {
    fetchSensors();
  }, []);

  // Listen for WebSocket updates to sensor data
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "sensor_update" && lastMessage.data) {
      const { id, value } = lastMessage.data;
      
      // Update the sensor with new data
      setSensors(prev => prev.map(sensor => {
        if (sensor.id === id) {
          return {
            ...sensor,
            currentValue: value,
            history: [
              { value, timestamp: new Date() },
              ...sensor.history.slice(0, 99) // Keep last 100 readings
            ]
          };
        }
        return sensor;
      }));
    }
  }, [lastMessage]);

  // Fetch all sensors
  const fetchSensors = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get("/api/sensors");
      // setSensors(response.data);
      
      // For demo, use mock data
      setSensors(mockSensors);
    } catch (err) {
      setError("Failed to fetch sensors");
      console.error("Error fetching sensors:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get a single sensor by ID
  const getSensor = (id: string) => {
    return sensors.find(sensor => sensor.id === id);
  };

  // Update a sensor
  const updateSensor = async (id: string, data: Partial<Sensor>) => {
    try {
      // In a real app, this would be an API call
      // await axios.put(`/api/sensors/${id}`, data);
      
      // Update local state
      setSensors(prev => prev.map(sensor => 
        sensor.id === id ? { ...sensor, ...data } : sensor
      ));
    } catch (err) {
      setError("Failed to update sensor");
      console.error("Error updating sensor:", err);
      throw err;
    }
  };

  // Create a new sensor
  const createSensor = async (sensor: Omit<Sensor, "id" | "history">) => {
    try {
      // In a real app, this would be an API call
      // const response = await axios.post("/api/sensors", sensor);
      // const newSensor = response.data;
      
      // For demo, create a mock response
      const newSensor: Sensor = {
        ...sensor,
        id: Date.now().toString(),
        history: [] // New sensor has no history
      };
      
      setSensors(prev => [...prev, newSensor]);
    } catch (err) {
      setError("Failed to create sensor");
      console.error("Error creating sensor:", err);
      throw err;
    }
  };

  // Delete a sensor
  const deleteSensor = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.delete(`/api/sensors/${id}`);
      
      // Update local state
      setSensors(prev => prev.filter(sensor => sensor.id !== id));
    } catch (err) {
      setError("Failed to delete sensor");
      console.error("Error deleting sensor:", err);
      throw err;
    }
  };

  // Update sensor thresholds
  const updateThresholds = async (id: string, warning: number, critical: number) => {
    try {
      // In a real app, this would be an API call
      // await axios.put(`/api/sensors/${id}/thresholds`, { warning, critical });
      
      // Update local state
      setSensors(prev => prev.map(sensor => {
        if (sensor.id === id) {
          return {
            ...sensor,
            thresholds: { warning, critical }
          };
        }
        return sensor;
      }));
    } catch (err) {
      setError("Failed to update thresholds");
      console.error("Error updating thresholds:", err);
      throw err;
    }
  };

  return (
    <SensorContext.Provider
      value={{
        sensors,
        loading,
        error,
        fetchSensors,
        getSensor,
        updateSensor,
        createSensor,
        deleteSensor,
        updateThresholds
      }}
    >
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