"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  AlertTriangle, 
  Shield, 
  Activity,
  Zap,
  Eye,
  EyeOff,
  RotateCcw,
  Maximize2
} from "lucide-react";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false });

// Mock data for demonstration
const mockSensors = [
  {
    id: "sensor-1",
    name: "Air Quality Monitor #1",
    type: "air_quality",
    status: "active",
    position: [40.7128, -74.0060],
    value: 45,
    unit: "AQI",
    severity: "good"
  },
  {
    id: "sensor-2", 
    name: "Temperature Sensor #2",
    type: "temperature",
    status: "active",
    position: [40.7589, -73.9851],
    value: 22,
    unit: "°C",
    severity: "normal"
  },
  {
    id: "sensor-3",
    name: "Chemical Detector #3", 
    type: "chemical",
    status: "alert",
    position: [40.7282, -73.7949],
    value: 85,
    unit: "ppm",
    severity: "high"
  },
  {
    id: "sensor-4",
    name: "Radiation Monitor #4",
    type: "radiation",
    status: "active", 
    position: [40.6892, -74.0445],
    value: 0.12,
    unit: "μSv/h",
    severity: "normal"
  }
];

const mockThreatZones = [
  {
    id: "zone-1",
    name: "Chemical Spill Zone",
    center: [40.7282, -73.7949],
    radius: 1000,
    severity: "high",
    type: "chemical",
    affectedPopulation: 2500
  },
  {
    id: "zone-2", 
    name: "Air Quality Alert Zone",
    center: [40.7128, -74.0060],
    radius: 500,
    severity: "medium",
    type: "air_quality",
    affectedPopulation: 800
  }
];

interface InteractiveThreatMapProps {
  height?: string;
  showControls?: boolean;
  className?: string;
}

export default function InteractiveThreatMap({ 
  height = "400px", 
  showControls = true,
  className = ""
}: InteractiveThreatMapProps) {
  const [mounted, setMounted] = useState(false);
  const [showSensors, setShowSensors] = useState(true);
  const [showThreatZones, setShowThreatZones] = useState(true);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSensorIcon = (sensor: any) => {
    const colors = {
      good: "#10B981",
      normal: "#3B82F6", 
      medium: "#F59E0B",
      high: "#EF4444",
      critical: "#DC2626"
    };
    
    const color = colors[sensor.severity as keyof typeof colors] || colors.normal;
    
    if (typeof window !== 'undefined' && window.L) {
      return window.L.divIcon({
        className: 'custom-sensor-icon',
        html: `
          <div style="
            background-color: ${color};
            width: 20px;
            height: 20px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 10px;
            font-weight: bold;
          ">
            ${sensor.type === 'air_quality' ? '🌬️' : 
              sensor.type === 'temperature' ? '🌡️' : 
              sensor.type === 'chemical' ? '⚗️' : '☢️'}
          </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
      });
    }
    return null;
  };

  const getThreatZoneColor = (severity: string) => {
    const colors = {
      low: "#10B981",
      medium: "#F59E0B", 
      high: "#EF4444",
      critical: "#DC2626"
    };
    return colors[severity as keyof typeof colors] || colors.medium;
  };

  if (!mounted) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading interactive map...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Live Threat Monitoring Map
            </CardTitle>
            <CardDescription>
              Real-time sensor data and threat zones powered by OpenStreetMap
            </CardDescription>
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <Button
                variant={showSensors ? "default" : "outline"}
                size="sm"
                onClick={() => setShowSensors(!showSensors)}
              >
                <Activity className="w-4 h-4 mr-1" />
                Sensors
              </Button>
              <Button
                variant={showThreatZones ? "default" : "outline"}
                size="sm"
                onClick={() => setShowThreatZones(!showThreatZones)}
              >
                <Shield className="w-4 h-4 mr-1" />
                Zones
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div style={{ height }} className="relative">
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
            className="rounded-b-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Threat Zones */}
            {showThreatZones && mockThreatZones.map((zone) => (
              <Circle
                key={zone.id}
                center={zone.center as [number, number]}
                radius={zone.radius}
                pathOptions={{
                  color: getThreatZoneColor(zone.severity),
                  fillColor: getThreatZoneColor(zone.severity),
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-1">{zone.name}</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Severity: </span>
                        <Badge variant={zone.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {zone.severity}
                        </Badge>
                      </div>
                      <p>Type: {zone.type.replace('_', ' ')}</p>
                      <p>Affected: {zone.affectedPopulation.toLocaleString()} people</p>
                      <p>Radius: {(zone.radius / 1000).toFixed(1)} km</p>
                    </div>
                  </div>
                </Popup>
              </Circle>
            ))}
            
            {/* Sensor Markers */}
            {showSensors && mockSensors.map((sensor) => {
              const sensorIcon = getSensorIcon(sensor);
              return sensorIcon ? (
                <Marker
                  key={sensor.id}
                  position={sensor.position as [number, number]}
                  icon={sensorIcon}
                  eventHandlers={{
                    click: () => setSelectedSensor(sensor.id)
                  }}
                >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-sm mb-2">{sensor.name}</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        <span>Status: </span>
                        <Badge variant={sensor.status === 'alert' ? 'destructive' : 'secondary'} className="text-xs">
                          {sensor.status}
                        </Badge>
                      </div>
                      <p>Current Value: <strong>{sensor.value} {sensor.unit}</strong></p>
                      <p>Type: {sensor.type.replace('_', ' ')}</p>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        <span>Severity: </span>
                        <Badge variant={sensor.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                          {sensor.severity}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
              ) : null;
            }).filter(Boolean)}
          </MapContainer>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
            <h4 className="text-xs font-semibold mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium Alert</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>High Alert</span>
              </div>
            </div>
          </div>
          
          {/* Live Status Indicator */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live Data</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
