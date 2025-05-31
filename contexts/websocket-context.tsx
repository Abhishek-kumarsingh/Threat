"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

type WebSocketContextType = {
  connected: boolean;
  sendMessage: (type: string, payload: any) => void;
  lastMessage: any;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  // Get auth state safely without causing dependency issues
  const getAuthState = () => {
    try {
      // Check if we have a token in localStorage
      return !!localStorage.getItem('authToken');
    } catch {
      return false;
    }
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const isAuthenticated = getAuthState();

    if (!isAuthenticated) {
      // Don't connect if not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Mock WebSocket URL - in a real app, this would be your WebSocket server URL
    // const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "wss://api.example.com/ws";

    // For demo purposes, we'll use a mock implementation
    const mockSocket = {
      send: (data: string) => {
        console.log("Mock WebSocket sending:", data);

        // Simulate receiving a response after sending a message
        setTimeout(() => {
          const message = JSON.parse(data);
          let response;

          // Mock different responses based on message type
          switch (message.type) {
            case "sensor_data":
              response = { type: "sensor_update", data: { id: "123", value: Math.random() * 100 } };
              break;
            case "alert":
              response = { type: "alert_created", data: { id: "456", severity: "high", message: "Test alert" } };
              break;
            default:
              response = { type: "ack", data: { received: true } };
          }

          handleMessage({ data: JSON.stringify(response) });
        }, 300);
      },
      close: () => {
        console.log("Mock WebSocket closed");
        setConnected(false);
      }
    };

    // Simulate connection established
    setSocket(mockSocket as unknown as WebSocket);
    setConnected(true);

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []); // Remove dependency on isAuthenticated

  // Handle incoming messages
  const handleMessage = useCallback((event: { data: string }) => {
    try {
      const message = JSON.parse(event.data);
      setLastMessage(message);

      // Here you could dispatch actions based on message type
      console.log("WebSocket message received:", message);
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  // Send message through WebSocket
  const sendMessage = useCallback((type: string, payload: any) => {
    if (!socket || !connected) {
      console.error("Cannot send message, WebSocket not connected");
      return;
    }

    const message = JSON.stringify({ type, data: payload });
    socket.send(message);
  }, [socket, connected]);

  return (
    <WebSocketContext.Provider value={{ connected, sendMessage, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};