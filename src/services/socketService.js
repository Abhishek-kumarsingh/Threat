// Lazy import socket.io-client to avoid SSR issues
let io = null;

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
  }

  async loadSocketIO() {
    if (!io && typeof window !== 'undefined') {
      try {
        const socketModule = await import('socket.io-client');
        io = socketModule.io;
      } catch (error) {
        console.error('Failed to load socket.io-client:', error);
        return false;
      }
    }
    return !!io;
  }

  async connect() {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.warn('SocketService: Cannot connect in server environment');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found for WebSocket connection');
      return;
    }

    // Load socket.io-client dynamically
    const loaded = await this.loadSocketIO();
    if (!loaded) {
      console.error('Failed to load socket.io-client');
      return;
    }

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

    try {
      this.socket = io(socketUrl, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create socket connection:', error);
    }
  }

  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });

      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnection();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.emit('connection_error', { error: error.message });
      this.handleReconnection();
    });

    // Handle real-time data events
    this.socket.on('sensor_reading', (data) => {
      this.emit('sensor_reading', data);
    });

    this.socket.on('alert_created', (data) => {
      this.emit('alert_created', data);
    });

    this.socket.on('alert_updated', (data) => {
      this.emit('alert_updated', data);
    });

    this.socket.on('threat_zone_created', (data) => {
      this.emit('threat_zone_created', data);
    });

    this.socket.on('threat_zone_updated', (data) => {
      this.emit('threat_zone_updated', data);
    });

    this.socket.on('system_notification', (data) => {
      this.emit('system_notification', data);
    });

    this.socket.on('user_notification', (data) => {
      this.emit('user_notification', data);
    });
  }

  handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('max_reconnect_attempts_reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to specific topics
  subscribe(topic, callback) {
    if (!this.eventListeners.has(topic)) {
      this.eventListeners.set(topic, new Set());
    }
    this.eventListeners.get(topic).add(callback);

    if (this.socket) {
      this.socket.emit('subscribe', topic);
    }
  }

  // Unsubscribe from topics
  unsubscribe(topic, callback) {
    if (this.eventListeners.has(topic)) {
      this.eventListeners.get(topic).delete(callback);

      if (this.eventListeners.get(topic).size === 0) {
        this.eventListeners.delete(topic);
        if (this.socket) {
          this.socket.emit('unsubscribe', topic);
        }
      }
    }
  }

  // Emit events to listeners
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Send data to server
  send(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send data');
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id
    };
  }

  // Subscribe to sensor updates for specific sensors
  subscribeSensorUpdates(sensorIds) {
    if (Array.isArray(sensorIds)) {
      sensorIds.forEach(id => this.subscribe(`sensor_${id}`, () => {}));
    } else {
      this.subscribe(`sensor_${sensorIds}`, () => {});
    }
  }

  // Subscribe to location-specific updates
  subscribeLocationUpdates(locationId) {
    this.subscribe(`location_${locationId}`, () => {});
  }

  // Subscribe to alert updates
  subscribeAlertUpdates() {
    this.subscribe('alerts', () => {});
  }

  // Subscribe to threat zone updates
  subscribeThreatZoneUpdates() {
    this.subscribe('threat_zones', () => {});
  }
}

export default new SocketService();
