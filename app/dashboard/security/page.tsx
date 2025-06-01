'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Lock, 
  Key, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Wifi,
  Database,
  Server,
  Globe
} from 'lucide-react';

const SecurityPage = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [encryptionEnabled, setEncryptionEnabled] = useState(true);
  const [auditLogsEnabled, setAuditLogsEnabled] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);

  const securityMetrics = [
    { label: 'Security Score', value: '94%', status: 'good', icon: <Shield className="w-5 h-5" /> },
    { label: 'Failed Login Attempts', value: '3', status: 'warning', icon: <Lock className="w-5 h-5" /> },
    { label: 'Active Sessions', value: '12', status: 'good', icon: <Eye className="w-5 h-5" /> },
    { label: 'Last Security Scan', value: '2h ago', status: 'good', icon: <CheckCircle className="w-5 h-5" /> }
  ];

  const securityEvents = [
    {
      id: '1',
      type: 'login_success',
      message: 'Successful login from admin@threatguard.com',
      timestamp: '2 hours ago',
      severity: 'info',
      ip: '192.168.1.100'
    },
    {
      id: '2',
      type: 'failed_login',
      message: 'Failed login attempt for unknown@example.com',
      timestamp: '4 hours ago',
      severity: 'warning',
      ip: '203.0.113.45'
    },
    {
      id: '3',
      type: 'permission_change',
      message: 'User permissions updated for operator@threatguard.com',
      timestamp: '1 day ago',
      severity: 'info',
      ip: '192.168.1.101'
    },
    {
      id: '4',
      type: 'api_access',
      message: 'API key accessed from new location',
      timestamp: '2 days ago',
      severity: 'warning',
      ip: '198.51.100.23'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Center</h1>
          <p className="text-muted-foreground">
            Monitor and manage system security settings
          </p>
        </div>
        <Button>
          <Shield className="w-4 h-4 mr-2" />
          Run Security Scan
        </Button>
      </div>

      {/* Security Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                    {metric.value}
                  </p>
                </div>
                <div className={getStatusColor(metric.status)}>
                  {metric.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="access">Access Control</TabsTrigger>
          <TabsTrigger value="encryption">Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Authentication Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
                <CardDescription>Configure user authentication settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch 
                    checked={twoFactorEnabled} 
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Input className="w-20" defaultValue="30" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Complexity</p>
                    <p className="text-sm text-muted-foreground">Enforce strong passwords</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            {/* System Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Server className="w-5 h-5 mr-2" />
                  System Security
                </CardTitle>
                <CardDescription>Core system security features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Data Encryption</p>
                    <p className="text-sm text-muted-foreground">Encrypt data at rest and in transit</p>
                  </div>
                  <Switch 
                    checked={encryptionEnabled} 
                    onCheckedChange={setEncryptionEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Audit Logging</p>
                    <p className="text-sm text-muted-foreground">Log all system activities</p>
                  </div>
                  <Switch 
                    checked={auditLogsEnabled} 
                    onCheckedChange={setAuditLogsEnabled}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Firewall Protection</p>
                    <p className="text-sm text-muted-foreground">Network access control</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                API Security
              </CardTitle>
              <CardDescription>Manage API keys and access tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Primary API Key</p>
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showApiKey ? 'sk_live_1234567890abcdef...' : '••••••••••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Regenerate</Button>
                    <Button variant="outline" size="sm">Revoke</Button>
                  </div>
                </div>
                <Button variant="outline">
                  <Key className="w-4 h-4 mr-2" />
                  Generate New API Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events Log</CardTitle>
              <CardDescription>Recent security-related activities and alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <p className="font-medium">{event.message}</p>
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>{event.timestamp}</span>
                        <span>IP: {event.ip}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Details
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Network Access</CardTitle>
                <CardDescription>Control network-level access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4" />
                    <span>VPN Required</span>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>IP Whitelist</span>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Rate Limiting</span>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Database Access</CardTitle>
                <CardDescription>Database security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4" />
                    <span>Connection Encryption</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4" />
                    <span>Access Logging</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Query Monitoring</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              All data is encrypted using AES-256 encryption. Encryption keys are rotated automatically every 90 days.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Data Encryption</CardTitle>
                <CardDescription>Encryption status for different data types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: 'Sensor Data', status: 'encrypted' },
                  { type: 'User Credentials', status: 'encrypted' },
                  { type: 'API Communications', status: 'encrypted' },
                  { type: 'Database Backups', status: 'encrypted' },
                  { type: 'Log Files', status: 'encrypted' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span>{item.type}</span>
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Encryption Keys</CardTitle>
                <CardDescription>Key management and rotation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Current Key Version</span>
                  <Badge>v2.1</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Rotation</span>
                  <span className="text-sm text-muted-foreground">15 days ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Next Rotation</span>
                  <span className="text-sm text-muted-foreground">75 days</span>
                </div>
                <Button variant="outline" className="w-full">
                  Rotate Keys Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityPage;
