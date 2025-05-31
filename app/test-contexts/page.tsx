"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Test each context provider individually
import { AuthProvider } from '@/contexts/auth-context';
import { AlertProvider } from '@/contexts/alert-context';
import { SensorProvider } from '../../src/contexts/SensorContext';
import { ThreatZoneProvider } from '../../src/contexts/ThreatZoneContext';
import { WebSocketProvider } from '@/contexts/websocket-context';
import { NotificationProvider } from '@/contexts/notification-context';

function TestComponent({ name }: { name: string }) {
  return (
    <div className="p-2 bg-green-100 rounded mb-2">
      ✅ {name} working
    </div>
  );
}

export default function TestContextsPage() {
  const [currentTest, setCurrentTest] = useState<string | null>(null);

  const tests = [
    { name: "AuthProvider", component: AuthProvider },
    { name: "WebSocketProvider", component: WebSocketProvider },
    { name: "NotificationProvider", component: NotificationProvider },
    { name: "AlertProvider", component: AlertProvider },
    { name: "SensorProvider", component: SensorProvider },
    { name: "ThreatZoneProvider", component: ThreatZoneProvider },
  ];

  const runTest = (testName: string, Provider: any) => {
    setCurrentTest(testName);
    try {
      // This will help us identify which provider is causing issues
      console.log(`Testing ${testName}...`);
    } catch (error) {
      console.error(`Error with ${testName}:`, error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Context Provider Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tests.map(({ name, component: Provider }) => (
                <Button
                  key={name}
                  onClick={() => runTest(name, Provider)}
                  variant={currentTest === name ? "default" : "outline"}
                  className="w-full"
                >
                  Test {name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test individual providers */}
        <Card>
          <CardHeader>
            <CardTitle>Individual Provider Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Test AuthProvider alone */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">AuthProvider Test:</h3>
              <AuthProvider>
                <TestComponent name="AuthProvider" />
              </AuthProvider>
            </div>

            {/* Test WebSocketProvider alone */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">WebSocketProvider Test:</h3>
              <WebSocketProvider>
                <TestComponent name="WebSocketProvider" />
              </WebSocketProvider>
            </div>

            {/* Test combination that might be problematic */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">WebSocket + Notification Test:</h3>
              <WebSocketProvider>
                <NotificationProvider>
                  <TestComponent name="WebSocket + Notification" />
                </NotificationProvider>
              </WebSocketProvider>
            </div>

            {/* Test all providers step by step */}
            <div className="border p-4 rounded">
              <h3 className="font-semibold mb-2">Progressive Provider Test:</h3>
              <AuthProvider>
                <SensorProvider>
                  <ThreatZoneProvider>
                    <WebSocketProvider>
                      <NotificationProvider>
                        <AlertProvider>
                          <TestComponent name="All Providers" />
                        </AlertProvider>
                      </NotificationProvider>
                    </WebSocketProvider>
                  </ThreatZoneProvider>
                </SensorProvider>
              </AuthProvider>
            </div>

          </CardContent>
        </Card>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
