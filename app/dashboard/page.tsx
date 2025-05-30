"use client";

import { useState } from "react";
import { 
  BarChart3, 
  Shield, 
  Wind, 
  AlertTriangle, 
  CheckCircle2, 
  CloudLightning,
  Thermometer,
  Droplets,
  Gauge,
  Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { useSensors } from "@/contexts/sensor-context";
import { useAlerts } from "@/contexts/alert-context";
import RecentAlertsList from "@/components/dashboard/recent-alerts-list";
import SensorStatusOverview from "@/components/dashboard/sensor-status-overview";
import AnalyticsChart from "@/components/dashboard/analytics-chart";
import ThreatMap from "@/components/maps/threat-map";

export default function DashboardPage() {
  const { user } = useAuth();
  const { sensors, loading: sensorsLoading } = useSensors();
  const { alerts, loading: alertsLoading } = useAlerts();
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");
  
  // Calculate summary data
  const onlineSensorsCount = sensors.filter(s => s.status === "online").length;
  const offlineSensorsCount = sensors.filter(s => s.status === "offline").length;
  const maintenanceSensorsCount = sensors.filter(s => s.status === "maintenance").length;
  
  const newAlertsCount = alerts.filter(a => a.status === "new").length;
  const acknowledgedAlertsCount = alerts.filter(a => a.status === "acknowledged").length;
  const resolvedAlertsCount = alerts.filter(a => a.status === "resolved").length;
  
  const criticalAlertsCount = alerts.filter(a => a.severity === "critical" && a.status !== "resolved").length;
  const highAlertsCount = alerts.filter(a => a.severity === "high" && a.status !== "resolved").length;

  // Determine sensor type icons
  const getSensorIcon = (type: string) => {
    switch(type) {
      case "air-quality":
        return <Wind className="h-4 w-4" />;
      case "temperature":
        return <Thermometer className="h-4 w-4" />;
      case "water-quality":
        return <Droplets className="h-4 w-4" />;
      default:
        return <Gauge className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
          <Button variant="outline" size="sm" className="ml-2">
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sensors Online</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineSensorsCount}</div>
            <p className="text-xs text-muted-foreground">
              {offlineSensorsCount} offline, {maintenanceSensorsCount} in maintenance
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newAlertsCount + acknowledgedAlertsCount}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlertsCount} critical, {highAlertsCount} high severity
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedAlertsCount}</div>
            <p className="text-xs text-muted-foreground">
              {acknowledgedAlertsCount} awaiting resolution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <CloudLightning className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems functioning normally
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="map">Threat Map</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Sensor Status</CardTitle>
                <CardDescription>
                  Current status of all monitoring sensors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SensorStatusOverview />
              </CardContent>
            </Card>
            
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle>Recent Alerts</CardTitle>
                <CardDescription>
                  Latest environmental alerts detected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RecentAlertsList />
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Sensor Readings</CardTitle>
              <CardDescription>
                Historical readings from all sensors
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant={timeRange === "24h" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("24h")}
                >
                  24h
                </Button>
                <Button 
                  variant={timeRange === "7d" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("7d")}
                >
                  7d
                </Button>
                <Button 
                  variant={timeRange === "30d" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("30d")}
                >
                  30d
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <AnalyticsChart timeRange={timeRange} />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>
                Manage and respond to environmental alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentAlertsList showAll />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Analytics</CardTitle>
              <CardDescription>
                Analyze trends and patterns in environmental data
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <Button 
                  variant={timeRange === "24h" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("24h")}
                >
                  24h
                </Button>
                <Button 
                  variant={timeRange === "7d" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("7d")}
                >
                  7d
                </Button>
                <Button 
                  variant={timeRange === "30d" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setTimeRange("30d")}
                >
                  30d
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-[500px]">
              <AnalyticsChart timeRange={timeRange} detailed />
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Map Tab */}
        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Visualization</CardTitle>
              <CardDescription>
                Geographic view of sensors and potential threat zones
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px]">
              <ThreatMap />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}