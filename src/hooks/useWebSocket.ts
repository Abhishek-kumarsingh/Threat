import { useEffect, useRef, useCallback } from 'react';
import socketService from '../services/socketService';

interface UseWebSocketOptions {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
  autoConnect?: boolean;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    onConnect,
    onDisconnect,
    onError,
    autoConnect = true
  } = options;

  const isConnectedRef = useRef(false);

  const connect = useCallback(() => {
    if (!isConnectedRef.current) {
      socketService.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    isConnectedRef.current = false;
  }, []);

  const subscribe = useCallback((event: string, callback: (data: any) => void) => {
    socketService.subscribe(event, callback);
    
    return () => {
      socketService.unsubscribe(event, callback);
    };
  }, []);

  const emit = useCallback((event: string, data: any) => {
    socketService.send(event, data);
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      isConnectedRef.current = true;
      onConnect?.();
    };

    const handleDisconnect = (data: { reason: string }) => {
      isConnectedRef.current = false;
      onDisconnect?.(data.reason);
    };

    const handleError = (data: { error: string }) => {
      onError?.(data.error);
    };

    // Subscribe to connection events
    const unsubscribeConnect = subscribe('connection_status', (data) => {
      if (data.connected) {
        handleConnect();
      } else {
        handleDisconnect(data);
      }
    });

    const unsubscribeError = subscribe('connection_error', handleError);

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    return () => {
      unsubscribeConnect();
      unsubscribeError();
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect, subscribe, onConnect, onDisconnect, onError]);

  return {
    connect,
    disconnect,
    subscribe,
    emit,
    isConnected: isConnectedRef.current,
    getStatus: () => socketService.getConnectionStatus()
  };
};

export default useWebSocket;
