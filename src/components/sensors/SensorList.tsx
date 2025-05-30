"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSensors } from "../../contexts/SensorContext";
import { useAuth } from "@/contexts/auth-context";
import { 
  Activity, 
  AlertTriangle, 
  Battery, 
  MapPin, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import Link from "next/link";

export const SensorList: React.FC = () => {
  const { sensors, loading, error, fetchSensors } = useSensors();
  const { hasPermission } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    fetchSensors();
  }, [fetchSensors]);

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

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      temperature: '🌡️',
      humidity: '💧',
      air_quality: '🌬️',
      motion: '🚶',
      pressure: '📊',
      light: '💡',
    };
    return icons[type] || '📡';
  };

  // Filter and sort sensors
  const filteredSensors = sensors
    .filter(sensor => {
      const matchesSearch = sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sensor.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           sensor.location.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || sensor.status === statusFilter;
      const matchesType = typeFilter === "all" || sensor.type === typeFilter;
      const matchesLocation = locationFilter === "all" || sensor.location.name === locationFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesLocation;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy as keyof typeof a];
      let bValue: any = b[sortBy as keyof typeof b];
      
      if (sortBy === 'location') {
        aValue = a.location.name;
        bValue = b.location.name;
      } else if (sortBy === 'lastReading') {
        aValue = a.lastReading?.timestamp || '';
        bValue = b.lastReading?.timestamp || '';
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Get unique values for filters
  const uniqueTypes = [...new Set(sensors.map(s => s.type))];
  const uniqueLocations = [...new Set(sensors.map(s => s.location.name))];

  if (loading) {
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
          Failed to load sensors: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sensors</h1>
          <p className="text-muted-foreground">
            Monitor and manage all sensor devices
          </p>
        </div>
        {hasPermission('write:sensors') && (
          <Button asChild>
            <Link href="/dashboard/sensors/new">
              <Plus className="w-4 h-4 mr-2" />
              Add Sensor
            </Link>
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search sensors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {getTypeIcon(type)} {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
              const [field, order] = value.split('-');
              setSortBy(field);
              setSortOrder(order as "asc" | "desc");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                <SelectItem value="location-asc">Location (A-Z)</SelectItem>
                <SelectItem value="status-asc">Status</SelectItem>
                <SelectItem value="lastReading-desc">Last Reading (Newest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sensors Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sensor List</CardTitle>
          <CardDescription>
            {filteredSensors.length} of {sensors.length} sensors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Reading</TableHead>
                <TableHead>Battery</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSensors.map((sensor) => (
                <TableRow key={sensor.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(sensor.type)}</span>
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-sm text-muted-foreground">ID: {sensor.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{sensor.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-sm">{sensor.location.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(sensor.status)}>
                      <Activity className="w-3 h-3 mr-1" />
                      {sensor.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sensor.lastReading ? (
                      <div>
                        <p className="font-medium">
                          {sensor.lastReading.value} {sensor.lastReading.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sensor.lastReading.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No data</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {sensor.batteryLevel !== undefined ? (
                      <div className="flex items-center space-x-1">
                        <Battery className={`w-4 h-4 ${getBatteryColor(sensor.batteryLevel)}`} />
                        <span className={`text-sm ${getBatteryColor(sensor.batteryLevel)}`}>
                          {sensor.batteryLevel}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/sensors/${sensor.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      {hasPermission('write:sensors') && (
                        <>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/dashboard/sensors/${sensor.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredSensors.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No sensors found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
