"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import alertService from "../src/services/alertService";

type Alert = {
  id: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "acknowledged" | "resolved";
  type: string;
  sensorId?: string;
  sensorName?: string;
  source?: {
    type: string;
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  triggerValue?: number;
  threshold?: number;
  affectedAreas?: string[];
  createdAt: string;
  timestamp?: Date;
  acknowledgedAt?: string;
  acknowledgedBy?: {
    id: string;
    name: string;
  };
  resolvedAt?: string;
  resolvedBy?: {
    id: string;
    name: string;
  };
};

type AlertContextType = {
  alerts: Alert[];
  activeAlerts: Alert[];
  loading: boolean;
  error: string | null;
  fetchAlerts: (params?: any) => Promise<void>;
  getAlert: (id: string) => Alert | undefined;
  acknowledgeAlert: (id: string, notes?: string) => Promise<void>;
  resolveAlert: (id: string, resolution?: string, notes?: string) => Promise<void>;
  createAlert: (alertData: any) => Promise<void>;
  updateAlert: (id: string, alertData: any) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  sendTestAlert?: (testData: any) => Promise<void>;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await alertService.getAllAlerts(params);
      setAlerts(response.data);
    } catch (error: any) {
      setError(error.message);
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAlert = async (alertData: any) => {
    try {
      const response = await alertService.createAlert(alertData);
      setAlerts(prev => [response.data, ...prev]);
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const updateAlert = async (id: string, alertData: any) => {
    try {
      const response = await alertService.updateAlert(id, alertData);
      setAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, ...response.data } : alert
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      await alertService.deleteAlert(id);
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Initial fetch of alerts
  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  // WebSocket integration will be handled by components that use this context
  // to avoid circular dependencies

  // Get a single alert by ID
  const getAlert = (id: string) => {
    return alerts.find(alert => alert.id === id);
  };

  // Acknowledge an alert
  const acknowledgeAlert = async (id: string, notes?: string) => {
    try {
      const response = await alertService.acknowledgeAlert(id, notes);
      setAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, ...response.data } : alert
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Resolve an alert
  const resolveAlert = async (id: string, resolution?: string, notes?: string) => {
    try {
      const response = await alertService.resolveAlert(id, resolution, notes);
      setAlerts(prev => prev.map(alert =>
        alert.id === id ? { ...alert, ...response.data } : alert
      ));
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  // Computed property for active alerts
  const activeAlerts = alerts.filter(alert => alert.status === "active");

  return (
    <AlertContext.Provider
      value={{
        alerts,
        activeAlerts,
        loading,
        error,
        fetchAlerts,
        getAlert,
        acknowledgeAlert,
        resolveAlert,
        createAlert,
        updateAlert,
        deleteAlert
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