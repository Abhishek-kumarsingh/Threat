/**
 * Application constants
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Authentication
export const AUTH_CONFIG = {
  TOKEN_KEY: 'authToken',
  REFRESH_TOKEN_KEY: 'refreshToken',
  USER_KEY: 'user',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
};

// Sensor Types
export const SENSOR_TYPES = {
  TEMPERATURE: 'temperature',
  HUMIDITY: 'humidity',
  AIR_QUALITY: 'air_quality',
  MOTION: 'motion',
  PRESSURE: 'pressure',
  LIGHT: 'light',
  SOUND: 'sound',
  VIBRATION: 'vibration',
} as const;

// Sensor Status
export const SENSOR_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ERROR: 'error',
  MAINTENANCE: 'maintenance',
} as const;

// Alert Severity
export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

// Alert Status
export const ALERT_STATUS = {
  ACTIVE: 'active',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
} as const;

// Threat Zone Status
export const THREAT_ZONE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PREDICTED: 'predicted',
  EXPIRED: 'expired',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  USER: 'user',
} as const;

// Permissions
export const PERMISSIONS = {
  // Sensor permissions
  READ_SENSORS: 'read:sensors',
  WRITE_SENSORS: 'write:sensors',
  DELETE_SENSORS: 'delete:sensors',
  
  // Alert permissions
  READ_ALERTS: 'read:alerts',
  WRITE_ALERTS: 'write:alerts',
  DELETE_ALERTS: 'delete:alerts',
  ACKNOWLEDGE_ALERTS: 'acknowledge:alerts',
  RESOLVE_ALERTS: 'resolve:alerts',
  
  // Threat zone permissions
  READ_THREAT_ZONES: 'read:threat_zones',
  WRITE_THREAT_ZONES: 'write:threat_zones',
  DELETE_THREAT_ZONES: 'delete:threat_zones',
  
  // User permissions
  READ_USERS: 'read:users',
  WRITE_USERS: 'write:users',
  DELETE_USERS: 'delete:users',
  
  // Admin permissions
  ADMIN_DASHBOARD: 'admin:dashboard',
  ADMIN_SETTINGS: 'admin:settings',
  ADMIN_SYSTEM: 'admin:system',
} as const;

// Color Schemes
export const COLORS = {
  SEVERITY: {
    low: '#3B82F6',      // blue
    medium: '#F59E0B',   // yellow
    high: '#F97316',     // orange
    critical: '#EF4444', // red
  },
  STATUS: {
    active: '#10B981',   // green
    inactive: '#6B7280', // gray
    error: '#EF4444',    // red
    warning: '#F59E0B',  // yellow
  },
  THREAT_LEVEL: {
    safe: '#10B981',     // green
    low: '#3B82F6',      // blue
    medium: '#F59E0B',   // yellow
    high: '#F97316',     // orange
    critical: '#EF4444', // red
  },
} as const;

// Chart Configuration
export const CHART_CONFIG = {
  COLORS: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'],
  GRID_COLOR: '#E5E7EB',
  TEXT_COLOR: '#6B7280',
  ANIMATION_DURATION: 300,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
} as const;

// WebSocket Events
export const WEBSOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECTION_ERROR: 'connection_error',
  
  // Sensor events
  SENSOR_READING: 'sensor_reading',
  SENSOR_STATUS_CHANGE: 'sensor_status_change',
  
  // Alert events
  ALERT_CREATED: 'alert_created',
  ALERT_UPDATED: 'alert_updated',
  ALERT_ACKNOWLEDGED: 'alert_acknowledged',
  ALERT_RESOLVED: 'alert_resolved',
  
  // Threat zone events
  THREAT_ZONE_CREATED: 'threat_zone_created',
  THREAT_ZONE_UPDATED: 'threat_zone_updated',
  THREAT_ZONE_DEACTIVATED: 'threat_zone_deactivated',
  
  // System events
  SYSTEM_NOTIFICATION: 'system_notification',
  USER_NOTIFICATION: 'user_notification',
  SYSTEM_STATUS_CHANGE: 'system_status_change',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  DASHBOARD_LAYOUT: 'dashboard_layout',
  NOTIFICATION_PREFERENCES: 'notification_preferences',
  RECENT_SEARCHES: 'recent_searches',
} as const;

// Time Intervals
export const TIME_INTERVALS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
} as const;

// Refresh Intervals
export const REFRESH_INTERVALS = {
  DASHBOARD: 30 * 1000,     // 30 seconds
  SENSORS: 10 * 1000,       // 10 seconds
  ALERTS: 5 * 1000,         // 5 seconds
  THREAT_ZONES: 60 * 1000,  // 1 minute
} as const;

// Map Configuration
export const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 40.7128, lng: -74.0060 }, // New York City
  DEFAULT_ZOOM: 12,
  MIN_ZOOM: 1,
  MAX_ZOOM: 20,
  CLUSTER_RADIUS: 50,
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  ALERT: 'alert',
} as const;

// Export all as default
export default {
  API_CONFIG,
  AUTH_CONFIG,
  SENSOR_TYPES,
  SENSOR_STATUS,
  ALERT_SEVERITY,
  ALERT_STATUS,
  THREAT_ZONE_STATUS,
  USER_ROLES,
  PERMISSIONS,
  COLORS,
  CHART_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  WEBSOCKET_EVENTS,
  STORAGE_KEYS,
  TIME_INTERVALS,
  REFRESH_INTERVALS,
  MAP_CONFIG,
  NOTIFICATION_TYPES,
};
