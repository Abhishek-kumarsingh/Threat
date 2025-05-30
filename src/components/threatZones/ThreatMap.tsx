"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useThreatZones } from "../../contexts/ThreatZoneContext";
import { useSensors } from "../../contexts/SensorContext";
import { 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Navigation,
  ZoomIn,
  ZoomOut,
  Layers,
  Info
} from "lucide-react";

// Mock map component since we don't have a real map library
const MapContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden border">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
        {/* Mock map background */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 400 300">
            {/* Mock roads */}
            <path d="M0,150 L400,150" stroke="#ccc" strokeWidth="2" />
            <path d="M200,0 L200,300" stroke="#ccc" strokeWidth="2" />
            <path d="M100,0 L100,300" stroke="#ddd" strokeWidth="1" />
            <path d="M300,0 L300,300" stroke="#ddd" strokeWidth="1" />
            <path d="M0,75 L400,75" stroke="#ddd" strokeWidth="1" />
            <path d="M0,225 L400,225" stroke="#ddd" strokeWidth="1" />
            
            {/* Mock buildings */}
            <rect x="50" y="50" width="80" height="60" fill="#e5e7eb" stroke="#9ca3af" />
            <rect x="270" y="80" width="100" height="80" fill="#e5e7eb" stroke="#9ca3af" />
            <rect x="150" y="200" width="90" height="70" fill="#e5e7eb" stroke="#9ca3af" />
            
            {/* Labels */}
            <text x="90" y="85" fontSize="10" fill="#6b7280" textAnchor="middle">Building A</text>
            <text x="320" y="125" fontSize="10" fill="#6b7280" textAnchor="middle">Building B</text>
            <text x="195" y="240" fontSize="10" fill="#6b7280" textAnchor="middle">Building C</text>
          </svg>
        </div>
        {children}
      </div>
    </div>
  );
};

export const ThreatMap: React.FC = () => {
  const { activeThreatZones, loading, error } = useThreatZones();
  const { sensors } = useSensors();
  
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showEvacuationRoutes, setShowEvacuationRoutes] = useState(false);
  const [mapZoom, setMapZoom] = useState(1);

  const getThreatLevelColor = (threatLevel: number) => {
    if (threatLevel >= 8) return 'bg-red-500';
    if (threatLevel >= 6) return 'bg-orange-500';
    if (threatLevel >= 4) return 'bg-yellow-500';
    if (threatLevel >= 2) return 'bg-blue-500';
    return 'bg-green-500';
  };

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

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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
          Failed to load threat map: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Threat Map</h1>
          <p className="text-muted-foreground">
            Real-time threat zone visualization and monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={activeThreatZones.length > 0 ? 'destructive' : 'default'}>
            <Shield className="w-3 h-3 mr-1" />
            {activeThreatZones.length} Active Zones
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Map */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Interactive Map</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={showSensors ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowSensors(!showSensors)}
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Sensors
                  </Button>
                  <Button
                    variant={showEvacuationRoutes ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowEvacuationRoutes(!showEvacuationRoutes)}
                  >
                    <Navigation className="w-4 h-4 mr-1" />
                    Routes
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMapZoom(Math.min(mapZoom + 0.2, 2))}>
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.5))}>
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <MapContainer>
                {/* Threat Zones */}
                {activeThreatZones.map((zone, index) => (
                  <div
                    key={zone.id}
                    className={`absolute cursor-pointer transition-all duration-200 ${
                      selectedZone?.id === zone.id ? 'scale-110' : ''
                    }`}
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`,
                      transform: `scale(${mapZoom})`,
                    }}
                    onClick={() => setSelectedZone(zone)}
                  >
                    {/* Threat Zone Circle */}
                    <div
                      className={`w-16 h-16 rounded-full ${getThreatLevelColor(zone.threatLevel)} opacity-60 border-2 border-white shadow-lg flex items-center justify-center`}
                    >
                      <span className="text-white font-bold text-xs">
                        {zone.threatLevel.toFixed(1)}
                      </span>
                    </div>
                    {/* Zone Label */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {zone.name}
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Sensors */}
                {showSensors && sensors.slice(0, 8).map((sensor, index) => (
                  <div
                    key={sensor.id}
                    className="absolute"
                    style={{
                      left: `${15 + index * 12}%`,
                      top: `${20 + (index % 3) * 25}%`,
                      transform: `scale(${mapZoom})`,
                    }}
                  >
                    <div
                      className={`w-3 h-3 rounded-full ${getSensorStatusColor(sensor.status)} border border-white shadow-sm`}
                      title={`${sensor.name} - ${sensor.status}`}
                    />
                  </div>
                ))}

                {/* Evacuation Routes */}
                {showEvacuationRoutes && activeThreatZones.map((zone, index) => (
                  zone.evacuationRoutes.map((route, routeIndex) => (
                    <div
                      key={`${zone.id}-${route.id}`}
                      className="absolute"
                      style={{
                        left: `${25 + index * 25}%`,
                        top: `${35 + index * 15}%`,
                        transform: `scale(${mapZoom})`,
                      }}
                    >
                      {/* Route Arrow */}
                      <div className="flex items-center">
                        <div className="w-8 h-0.5 bg-blue-500"></div>
                        <div className="w-0 h-0 border-l-4 border-l-blue-500 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                      </div>
                      <div className="text-xs text-blue-600 mt-1 whitespace-nowrap">
                        {route.name}
                      </div>
                    </div>
                  ))
                ))}
              </MapContainer>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="w-4 h-4 mr-2" />
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium mb-2">Threat Levels</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm">Critical (8-10)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-sm">High (6-8)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Medium (4-6)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Low (2-4)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm">Safe (0-2)</span>
                  </div>
                </div>
              </div>
              
              {showSensors && (
                <div>
                  <h4 className="font-medium mb-2">Sensors</h4>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Active</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm">Inactive</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm">Error</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Zone Details */}
          {selectedZone && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Zone Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{selectedZone.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedZone.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Threat Level:</span>
                    <div className="font-medium">{selectedZone.threatLevel.toFixed(1)}/10</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Severity:</span>
                    <Badge className={getSeverityColor(selectedZone.severity)} variant="outline">
                      {selectedZone.severity}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Population:</span>
                    <div className="font-medium">{selectedZone.estimatedPopulation}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <div className="font-medium">{selectedZone.status}</div>
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground text-sm">Location:</span>
                  <div className="font-medium">{selectedZone.location.name}</div>
                </div>

                {selectedZone.evacuationRoutes.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-sm">Evacuation Routes:</span>
                    <div className="space-y-1 mt-1">
                      {selectedZone.evacuationRoutes.map((route: any) => (
                        <div key={route.id} className="text-sm">
                          <span className="font-medium">{route.name}</span>
                          {route.estimatedTime && (
                            <span className="text-muted-foreground ml-2">
                              ({route.estimatedTime})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Button size="sm" className="w-full">
                    View Full Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Zones Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Active Zones</CardTitle>
              <CardDescription>
                {activeThreatZones.length} zones requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeThreatZones.slice(0, 5).map((zone) => (
                  <div
                    key={zone.id}
                    className={`p-2 rounded border cursor-pointer transition-colors ${
                      selectedZone?.id === zone.id ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedZone(zone)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{zone.name}</span>
                      <Badge className={getSeverityColor(zone.severity)} variant="outline">
                        {zone.severity}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Level: {zone.threatLevel.toFixed(1)} • {zone.location.name}
                    </div>
                  </div>
                ))}
                
                {activeThreatZones.length === 0 && (
                  <p className="text-center text-muted-foreground py-4 text-sm">
                    No active threat zones
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
