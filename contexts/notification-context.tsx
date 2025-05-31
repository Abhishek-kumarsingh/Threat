"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "./websocket-context";

type Notification = {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  // Safely get WebSocket context
  let lastMessage = null;
  try {
    const webSocketContext = useWebSocket();
    lastMessage = webSocketContext?.lastMessage;
  } catch (error) {
    console.warn("WebSocket context not available in NotificationProvider:", error);
  }

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add a new notification
  const addNotification = (notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show toast notification
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    });
  };

  // Listen for WebSocket messages that should trigger notifications
  useEffect(() => {
    if (!lastMessage) return;

    try {
      // Check if the message should trigger a notification
      if (lastMessage.type === "alert_created" || lastMessage.type === "sensor_threshold_exceeded") {
        // Create a notification from the WebSocket message
        const notificationType = lastMessage.type === "alert_created" ? "warning" : "error";
        const notificationTitle = lastMessage.type === "alert_created" ? "New Alert" : "Threshold Exceeded";

        addNotification({
          type: notificationType,
          title: notificationTitle,
          message: lastMessage.data?.message || "Please check the dashboard for details.",
        });
      }
    } catch (error) {
      console.error("Error processing WebSocket message in notifications:", error);
    }
  }, [lastMessage]);

  // Mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Clear all notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};