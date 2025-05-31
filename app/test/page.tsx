'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestPage() {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [sensors, setSensors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const testAPI = async () => {
    try {
      setLoading(true);
      
      // Test basic API connection
      const apiResponse = await fetch('http://localhost:5000/api');
      if (apiResponse.ok) {
        setApiStatus('✅ Connected');
      } else {
        setApiStatus('❌ Connection Failed');
      }

      // Test sensors endpoint
      const sensorsResponse = await fetch('http://localhost:5000/api/sensors');
      if (sensorsResponse.ok) {
        const sensorsData = await sensorsResponse.json();
        setSensors(sensorsData.data || []);
      }

      // Test alerts endpoint
      const alertsResponse = await fetch('http://localhost:5000/api/alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.data || []);
      }

      // Test dashboard endpoint
      const dashboardResponse = await fetch('http://localhost:5000/api/dashboard');
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboard(dashboardData.data);
      }

    } catch (error) {
      console.error('API Test Error:', error);
      setApiStatus('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 API Integration Test</h1>
        <p className="text-muted-foreground">Testing frontend-backend connectivity</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* API Status */}
        <Card>
          <CardHeader>
            <CardTitle>API Connection</CardTitle>
            <CardDescription>Backend connectivity status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">{apiStatus}</div>
            <Button onClick={testAPI} className="mt-4" disabled={loading}>
              {loading ? 'Testing...' : 'Retest API'}
            </Button>
          </CardContent>
        </Card>

        {/* Sensors */}
        <Card>
          <CardHeader>
            <CardTitle>Sensors</CardTitle>
            <CardDescription>Sensor data from backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{sensors.length}</div>
            <div className="text-sm text-muted-foreground">Total Sensors</div>
            {sensors.slice(0, 3).map((sensor, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                <div className="font-medium">{sensor.name}</div>
                <Badge variant={sensor.status === 'online' ? 'default' : 'destructive'}>
                  {sensor.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alerts</CardTitle>
            <CardDescription>Alert data from backend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{alerts.length}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
            {alerts.slice(0, 3).map((alert, index) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                <div className="font-medium">{alert.title}</div>
                <Badge variant={
                  alert.severity === 'critical' ? 'destructive' : 
                  alert.severity === 'high' ? 'destructive' : 
                  alert.severity === 'medium' ? 'secondary' : 'default'
                }>
                  {alert.severity}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Dashboard Data */}
        {dashboard && (
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Dashboard Summary</CardTitle>
              <CardDescription>Real-time system overview</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{dashboard.totalSensors || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{dashboard.activeSensors || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{dashboard.totalAlerts || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Alerts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{dashboard.activeAlerts || 0}</div>
                  <div className="text-sm text-muted-foreground">Active Alerts</div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <div className="font-medium">System Status: 
                  <Badge className="ml-2" variant={dashboard.systemStatus === 'operational' ? 'default' : 'destructive'}>
                    {dashboard.systemStatus || 'Unknown'}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Last Update: {dashboard.lastUpdate ? new Date(dashboard.lastUpdate).toLocaleString() : 'Never'}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Raw Data Display */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw API Responses</CardTitle>
          <CardDescription>Debug information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Sensors Response:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(sensors, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Alerts Response:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(alerts, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-medium">Dashboard Response:</h4>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                {JSON.stringify(dashboard, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
