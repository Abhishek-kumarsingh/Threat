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
import { 
  AlertTriangle, 
  Activity, 
  MapPin, 
  Shield, 
  Settings,
  Clock,
  Eye,
  CheckCircle,
  MessageSquare,
  Play,
  Pause
} from "lucide-react";

export const OperatorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { alerts, activeAlerts, loading: alertsLoading, acknowledgeAlert, resolveAlert } = useAlerts();
  const { sensors, sensorStatus, loading: sensorsLoading } = useSensors();
  const { activeThreatZones, loading: threatZonesLoading } = useThreatZones();
  
  const [selectedTab, setSelectedTab] = useState("overview");

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert(alertId, 'Acknowledged by operator');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlert(alertId, 'Resolved by operator', 'Issue addressed by operator');
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  if (alertsLoading || sensorsLoading || threatZonesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Filter data for operator view
  const criticalAlerts = activeAlerts.filter(alert => alert.severity === 'critical');
  const highPriorityAlerts = activeAlerts.filter(alert => alert.severity === 'high');
  const problemSensors = sensors.filter(sensor => sensor.status === 'error' || sensor.status === 'inactive');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operator Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage system operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={criticalAlerts.length > 0 ? 'destructive' : 'default'}>
            <AlertTriangle className="w-3 h-3 mr-1" />
            {criticalAlerts.length} Critical
          </Badge>
          <Badge variant={problemSensors.length > 0 ? 'destructive' : 'default'}>
            <Activity className="w-3 h-3 mr-1" />
            {problemSensors.length} Issues
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
              {activeAlerts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts.length} critical, {highPriorityAlerts.length} high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensor Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sensorStatus?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {sensorStatus?.total || 0} total sensors
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
              Active monitoring zones
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Good
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alert Management</TabsTrigger>
          <TabsTrigger value="sensors">Sensor Monitoring</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Critical Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                  Critical Alerts
                </CardTitle>
                <CardDescription>Immediate attention required</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg bg-red-50 border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {criticalAlerts.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No critical alerts</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Problem Sensors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-orange-500" />
                  Sensor Issues
                </CardTitle>
                <CardDescription>Sensors requiring attention</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {problemSensors.slice(0, 5).map((sensor) => (
                  <div key={sensor.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        sensor.status === 'error' ? 'bg-red-500' : 'bg-gray-500'
                      }`} />
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-sm text-muted-foreground">{sensor.location.name}</p>
                        <Badge className={getStatusColor(sensor.status)} variant="outline">
                          {sensor.status}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {problemSensors.length === 0 && (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">All sensors operational</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Active Threat Zones */}
          {activeThreatZones.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-4 h-4 mr-2 text-orange-500" />
                  Active Threat Zones
                </CardTitle>
                <CardDescription>Current threat zone monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeThreatZones.map((zone) => (
                  <div key={zone.id} className="p-4 border rounded-lg">
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
                          {zone.estimatedPopulation} people
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
                        <Badge className={getSeverityColor(alert.severity)} variant="outline">
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {formatTimeAgo(alert.createdAt)}</span>
                        {alert.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {alert.location.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {alert.status === 'active' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAcknowledge(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      )}
                      <Button 
                        variant="default" 
                        size="sm"
                        onClick={() => handleResolve(alert.id)}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sensor Monitoring</CardTitle>
              <CardDescription>Monitor sensor status and readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {sensors.slice(0, 9).map((sensor) => (
                  <div key={sensor.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{sensor.name}</h4>
                      <Badge className={getStatusColor(sensor.status)} variant="outline">
                        {sensor.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{sensor.location.name}</p>
                    {sensor.lastReading && (
                      <div className="mt-2">
                        <p className="text-lg font-semibold">
                          {sensor.lastReading.value} {sensor.lastReading.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimeAgo(sensor.lastReading.timestamp)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Operations</CardTitle>
              <CardDescription>Control system operations and maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h4 className="font-medium">System Controls</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Play className="w-4 h-4 mr-2" />
                      Start Monitoring
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Pause className="w-4 h-4 mr-2" />
                      Pause Monitoring
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      System Settings
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Create Manual Alert
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-2" />
                      Run Diagnostics
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="w-4 h-4 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
