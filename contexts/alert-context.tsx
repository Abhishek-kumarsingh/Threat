"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWebSocket } from "./websocket-context";
import { useNotifications } from "./notification-context";

type Alert = {
  id: string;
  sensorId: string;
  sensorName: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  message: string;
  timestamp: Date;
  status: "new" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
};

type AlertContextType = {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: () => Promise<void>;
  getAlert: (id: string) => Alert | undefined;
  acknowledgeAlert: (id: string) => Promise<void>;
  resolveAlert: (id: string) => Promise<void>;
  createAlert: (alert: Omit<Alert, "id" | "timestamp" | "status">) => Promise<void>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Mock alert data
const mockAlerts: Alert[] = [
  {
    id: "1",
    sensorId: "1",
    sensorName: "Air Quality Monitor 1",
    type: "threshold_exceeded",
    severity: "medium",
    message: "Air quality index exceeded warning threshold (65 > 50)",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    status: "new"
  },
  {
    id: "2",
    sensorId: "2",
    sensorName: "Temperature Sensor 1",
    type: "threshold_exceeded",
    severity: "high",
    message: "Temperature exceeded critical threshold (37°C > 35°C)",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: "acknowledged",
    acknowledgedBy: "John Doe"
  },
  {
    id: "3",
    sensorId: "3",
    sensorName: "Water Quality Monitor 1",
    type: "connection_lost",
    severity: "critical",
    message: "Connection lost with Water Quality Monitor 1",
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: "resolved",
    acknowledgedBy: "Jane Smith",
    resolvedBy: "Jane Smith",
    resolvedAt: new Date(Date.now() - 43200000) // 12 hours ago
  }
];

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { lastMessage } = useWebSocket();
  const { addNotification } = useNotifications();

  // Initial fetch of alerts
  useEffect(() => {
    fetchAlerts();
  }, []);

  // Listen for WebSocket updates for new alerts
  useEffect(() => {
    if (!lastMessage) return;

    if (lastMessage.type === "alert_created" && lastMessage.data) {
      // Create a new alert from the WebSocket message
      const newAlert: Alert = {
        id: lastMessage.data.id || Date.now().toString(),
        sensorId: lastMessage.data.sensorId || "unknown",
        sensorName: lastMessage.data.sensorName || "Unknown Sensor",
        type: lastMessage.data.type || "unknown",
        severity: lastMessage.data.severity || "medium",
        message: lastMessage.data.message || "New alert detected",
        timestamp: new Date(),
        status: "new"
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
      // Also create a notification
      addNotification({
        type: newAlert.severity === "critical" || newAlert.severity === "high" ? "error" : "warning",
        title: `New ${newAlert.severity} Alert`,
        message: newAlert.message
      });
    }
  }, [lastMessage, addNotification]);

  // Fetch all alerts
  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, this would be an API call
      // const response = await axios.get("/api/alerts");
      // setAlerts(response.data);
      
      // For demo, use mock data
      setAlerts(mockAlerts);
    } catch (err) {
      setError("Failed to fetch alerts");
      console.error("Error fetching alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get a single alert by ID
  const getAlert = (id: string) => {
    return alerts.find(alert => alert.id === id);
  };

  // Acknowledge an alert
  const acknowledgeAlert = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.put(`/api/alerts/${id}/acknowledge`);
      
      // Update local state
      setAlerts(prev => prev.map(alert => {
        if (alert.id === id && alert.status === "new") {
          return {
            ...alert,
            status: "acknowledged",
            acknowledgedBy: "Current User" // In a real app, this would be the actual user
          };
        }
        return alert;
      }));
    } catch (err) {
      setError("Failed to acknowledge alert");
      console.error("Error acknowledging alert:", err);
      throw err;
    }
  };

  // Resolve an alert
  const resolveAlert = async (id: string) => {
    try {
      // In a real app, this would be an API call
      // await axios.put(`/api/alerts/${id}/resolve`);
      
      // Update local state
      setAlerts(prev => prev.map(alert => {
        if (alert.id === id && (alert.status === "new" || alert.status === "acknowledged")) {
          return {
            ...alert,
            status: "resolved",
            resolvedBy: "Current User", // In a real app, this would be the actual user
            resolvedAt: new Date()
          };
        }
        return alert;
      }));
    } catch (err) {
      setError("Failed to resolve alert");
      console.error("Error resolving alert:", err);
      throw err;
    }
  };

  // Create a new alert
  const createAlert = async (alert: Omit<Alert, "id" | "timestamp" | "status">) => {
    try {
      // In a real app, this would be an API call
      // const response = await axios.post("/api/alerts", alert);
      // const newAlert = response.data;
      
      // For demo, create a mock response
      const newAlert: Alert = {
        ...alert,
        id: Date.now().toString(),
        timestamp: new Date(),
        status: "new"
      };
      
      setAlerts(prev => [newAlert, ...prev]);
      
      // Also create a notification
      addNotification({
        type: newAlert.severity === "critical" || newAlert.severity === "high" ? "error" : "warning",
        title: `New ${newAlert.severity} Alert`,
        message: newAlert.message
      });
    } catch (err) {
      setError("Failed to create alert");
      console.error("Error creating alert:", err);
      throw err;
    }
  };

  return (
    <AlertContext.Provider
      value={{
        alerts,
        loading,
        error,
        fetchAlerts,
        getAlert,
        acknowledgeAlert,
        resolveAlert,
        createAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlerts must be used within an AlertProvider");
  }
  return context;
};