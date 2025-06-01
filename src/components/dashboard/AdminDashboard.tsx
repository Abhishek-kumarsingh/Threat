"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { useAlerts } from "@/contexts/alert-context";
import { useSensors } from "../../contexts/SensorContext";
import { useThreatZones } from "../../contexts/ThreatZoneContext";
import { AlertTriangle, Activity, MapPin, Users, TrendingUp, Shield, Network } from "lucide-react";
import api from "../../services/api";

interface DashboardStats {
  systemHealth: {
    status: string;
    uptime: string;
    lastRestart: string;
  };
  statistics: {
    totalSensors: number;
    activeSensors: number;
    totalLocations: number;
    totalUsers: number;
    activeAlerts: number;
    activeThreatZones: number;
  };
  recentActivity: Array<{
    type: string;
    message: string;
    timestamp: string;
  }>;
  systemAlerts: Array<{
    type: string;
    message: string;
    severity: string;
    timestamp: string;
  }>;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { activeAlerts, loading: alertsLoading } = useAlerts();
  const { sensors, sensorStatus, loading: sensorsLoading } = useSensors();
  const { activeThreatZones, loading: threatZonesLoading } = useThreatZones();
  
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard');
        setDashboardData(response.data.data);
      } catch (error: any) {
        setError(error.message);
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
      low: "secondary",
      medium: "outline",
      high: "default",
      critical: "destructive"
    };
    return variants[severity] || "default";
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
          Failed to load dashboard data: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management console
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={dashboardData?.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
            <Activity className="w-3 h-3 mr-1" />
            {dashboardData?.systemHealth.status || 'Unknown'}
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sensors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensorStatus?.active || dashboardData?.statistics.activeSensors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              of {sensorStatus?.total || dashboardData?.statistics.totalSensors || 0} total sensors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
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
              {activeThreatZones.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active zones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.systemHealth.uptime || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Since last restart
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Recent Alerts</TabsTrigger>
          <TabsTrigger value="activity">System Activity</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Architecture Quick Access */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Network className="w-5 h-5 mr-2" />
                System Architecture
              </CardTitle>
              <CardDescription>View complete hardware-to-ML-to-frontend flow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Badge className="bg-red-100 text-red-800">Hardware</Badge>
                    <Badge className="bg-purple-100 text-purple-800">ML Models</Badge>
                    <Badge className="bg-teal-100 text-teal-800">Dashboard</Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    6 layers • Real-time data flow • Interactive diagram
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open('/system-architecture', '_blank')}
                >
                  View Architecture
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>Latest system alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">{alert.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant={getSeverityBadge(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </div>
                ))}
                {activeAlerts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No active alerts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Active Threat Zones */}
            <Card>
              <CardHeader>
                <CardTitle>Active Threat Zones</CardTitle>
                <CardDescription>Current threat zone predictions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeThreatZones.slice(0, 5).map((zone) => (
                  <div key={zone.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{zone.name}</p>
                      <p className="text-sm text-muted-foreground">{zone.location.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Threat Level: {zone.threatLevel.toFixed(1)}/10
                      </p>
                    </div>
                    <Badge variant={getSeverityBadge(zone.severity)}>
                      {zone.severity}
                    </Badge>
                  </div>
                ))}
                {activeThreatZones.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No active threat zones
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>Manage and respond to system alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{alert.title}</h4>
                        <Badge variant={getSeverityBadge(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                        {alert.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {alert.location.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        Acknowledge
                      </Button>
                      <Button variant="default" size="sm">
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>System events and user actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Database</h4>
                    <p className={`text-sm ${getStatusColor('healthy')}`}>Healthy</p>
                    <p className="text-xs text-muted-foreground">Response time: 15ms</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">WebSocket</h4>
                    <p className={`text-sm ${getStatusColor('healthy')}`}>Connected</p>
                    <p className="text-xs text-muted-foreground">Active connections: 25</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium">Prediction Engine</h4>
                    <p className={`text-sm ${getStatusColor('healthy')}`}>Running</p>
                    <p className="text-xs text-muted-foreground">Last run: 5 min ago</p>
                  </div>
                </div>
                
                {dashboardData?.systemAlerts && dashboardData.systemAlerts.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">System Alerts</h4>
                    {dashboardData.systemAlerts.map((alert, index) => (
                      <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {alert.message}
                          <span className="block text-xs text-muted-foreground mt-1">
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
