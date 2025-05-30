"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useAlerts } from "@/contexts/alert-context";
import { useSensors } from "../../contexts/SensorContext";
import { useThreatZones } from "../../contexts/ThreatZoneContext";
import { 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Shield, 
  Bell,
  Clock,
  Eye,
  CheckCircle
} from "lucide-react";
import api from "../../services/api";

interface UserDashboardData {
  userInfo: {
    id: string;
    name: string;
    role: string;
    assignedLocations: number[];
  };
  relevantAlerts: any[];
  assignedSensors: any[];
  threatZones: any[];
  notifications: {
    unread: number;
    recent: any[];
  };
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeAlerts, loading: alertsLoading } = useAlerts();
  const { sensors, loading: sensorsLoading } = useSensors();
  const { activeThreatZones, loading: threatZonesLoading } = useThreatZones();
  
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDashboard = async () => {
      try {
        const response = await api.get('/dashboard/user');
        setDashboardData(response.data.data);
      } catch (error: any) {
        setError(error.message);
        console.error('Failed to fetch user dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDashboard();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading || alertsLoading || sensorsLoading || threatZonesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard: {error}
        </AlertDescription>
      </Alert>
    );
  }

  // Filter relevant data for user
  const userRelevantAlerts = activeAlerts.slice(0, 5);
  const userAssignedSensors = sensors.filter(sensor => sensor.status === 'active').slice(0, 6);
  const userThreatZones = activeThreatZones.filter(zone => zone.estimatedPopulation > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in your monitored areas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={userRelevantAlerts.length > 0 ? 'destructive' : 'default'}>
            <Bell className="w-3 h-3 mr-1" />
            {userRelevantAlerts.length} Active Alerts
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {userRelevantAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring your attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitored Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userAssignedSensors.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threat Zones</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {userThreatZones.length}
            </div>
            <p className="text-xs text-muted-foreground">
              In your areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.notifications.unread || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>Latest alerts in your monitored areas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userRelevantAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{alert.title}</h4>
                    <Badge className={getSeverityColor(alert.severity)} variant="outline">
                      {alert.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                    {alert.location && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {alert.location.name}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {userRelevantAlerts.length === 0 && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No active alerts</p>
                <p className="text-sm text-muted-foreground">All systems are operating normally</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sensor Status */}
        <Card>
          <CardHeader>
            <CardTitle>Sensor Status</CardTitle>
            <CardDescription>Your assigned sensors overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {userAssignedSensors.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    sensor.status === 'active' ? 'bg-green-500' : 
                    sensor.status === 'inactive' ? 'bg-gray-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="font-medium">{sensor.name}</p>
                    <p className="text-sm text-muted-foreground">{sensor.location.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  {sensor.lastReading ? (
                    <div>
                      <p className="font-medium text-sm">
                        {sensor.lastReading.value} {sensor.lastReading.unit}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(sensor.lastReading.timestamp)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No data</span>
                  )}
                </div>
              </div>
            ))}
            {userAssignedSensors.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No sensors assigned
              </p>
            )}
          </CardContent>
        </Card>

        {/* Threat Zones */}
        {userThreatZones.length > 0 && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-orange-500" />
                Active Threat Zones
              </CardTitle>
              <CardDescription>Areas requiring attention in your vicinity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userThreatZones.map((zone) => (
                <div key={zone.id} className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{zone.name}</h4>
                      <p className="text-sm text-muted-foreground">{zone.location.name}</p>
                      <p className="text-sm mt-1">
                        Threat Level: <span className="font-medium">{zone.threatLevel.toFixed(1)}/10</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getSeverityColor(zone.severity)} variant="outline">
                        {zone.severity}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {zone.estimatedPopulation} people affected
                      </p>
                    </div>
                  </div>
                  {zone.evacuationRoutes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-orange-200">
                      <p className="text-sm font-medium">Evacuation Routes:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {zone.evacuationRoutes.map((route: any) => (
                          <Badge key={route.id} variant="outline" className="text-xs">
                            {route.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Notifications */}
        {dashboardData?.notifications.recent && dashboardData.notifications.recent.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Latest system notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {dashboardData.notifications.recent.slice(0, 5).map((notification, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded border">
                  <Bell className="w-4 h-4 text-blue-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
