'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';

const ReportsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  const reportTypes = [
    {
      id: 'sensor-activity',
      title: 'Sensor Activity Report',
      description: 'Detailed analysis of sensor readings and performance',
      icon: <Activity className="w-5 h-5" />,
      lastGenerated: '2 hours ago',
      status: 'ready'
    },
    {
      id: 'threat-analysis',
      title: 'Threat Analysis Report',
      description: 'Comprehensive threat zone analysis and predictions',
      icon: <AlertTriangle className="w-5 h-5" />,
      lastGenerated: '1 day ago',
      status: 'ready'
    },
    {
      id: 'system-performance',
      title: 'System Performance Report',
      description: 'ML model performance and system health metrics',
      icon: <TrendingUp className="w-5 h-5" />,
      lastGenerated: '3 hours ago',
      status: 'generating'
    },
    {
      id: 'compliance',
      title: 'Compliance Report',
      description: 'Regulatory compliance and safety standards',
      icon: <FileBarChart className="w-5 h-5" />,
      lastGenerated: '1 week ago',
      status: 'ready'
    }
  ];

  const quickStats = [
    { label: 'Total Reports Generated', value: '247', change: '+12%' },
    { label: 'Active Sensors Monitored', value: '18', change: '+2' },
    { label: 'Threat Incidents', value: '3', change: '-50%' },
    { label: 'System Uptime', value: '99.8%', change: '+0.2%' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">
            Generate and download system reports and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <Badge variant="outline" className="text-green-600">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="available" className="space-y-4">
        <TabsList>
          <TabsTrigger value="available">Available Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {reportTypes.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    {report.icon}
                    <span className="ml-2">{report.title}</span>
                  </CardTitle>
                  <CardDescription>{report.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        Last: {report.lastGenerated}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                      <Button size="sm" disabled={report.status === 'generating'}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Manage automated report generation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Weekly Threat Analysis</h4>
                    <p className="text-sm text-muted-foreground">Every Monday at 9:00 AM</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Monthly Compliance Report</h4>
                    <p className="text-sm text-muted-foreground">First day of each month</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Sensor Readings Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Alert Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="w-5 h-5 mr-2" />
                  System Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 bg-gray-100 rounded flex items-center justify-center">
                  <p className="text-muted-foreground">Chart placeholder</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
