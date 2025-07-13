"use client";

import { useEffect, useState } from "react";
import { useSensors } from "@/contexts/sensor-context";
import { useAlerts } from "@/contexts/alert-context";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function ThreatMap() {
  const { sensors } = useSensors();
  const { alerts } = useAlerts();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markersLayer, setMarkersLayer] = useState<any>(null);
  const [threatZonesLayer, setThreatZonesLayer] = useState<any>(null);
  const [activeLayer, setActiveLayer] = useState<"all" | "alerts" | "threats">("all");

  // Initialize map on component mount
  useEffect(() => {
    // Check if we're running in a browser and if Leaflet is not already loaded
    if (typeof window !== "undefined" && !window.L) {
      // Load Leaflet CSS
      const linkElement = document.createElement("link");
      linkElement.rel = "stylesheet";
      linkElement.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      linkElement.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
      linkElement.crossOrigin = "";
      document.head.appendChild(linkElement);

      // Load Leaflet JS
      const scriptElement = document.createElement("script");
      scriptElement.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      scriptElement.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
      scriptElement.crossOrigin = "";
      scriptElement.onload = initializeMap;
      document.head.appendChild(scriptElement);
    } else if (typeof window !== "undefined" && window.L) {
      // Leaflet is already loaded
      initializeMap();
    }

    return () => {
      // Clean up map instance on component unmount
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);

  // Update map when sensors or alerts change
  useEffect(() => {
    if (mapLoaded && mapInstance && sensors.length > 0) {
      updateMapMarkers();
    }
  }, [mapLoaded, sensors, alerts, activeLayer]);

  // Initialize the map
  const initializeMap = () => {
    if (typeof window === "undefined" || !window.L) return;
    const L = window.L;

    // Create map instance
    const map = L.map("map", {
      center: [40.7128, -74.006], // Default to NYC
      zoom: 12,
    });

    // Add tile layer (map background)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Create layers for markers and threat zones
    const markers = L.layerGroup().addTo(map);
    const threatZones = L.layerGroup().addTo(map);

    setMapInstance(map);
    setMarkersLayer(markers);
    setThreatZonesLayer(threatZones);
    setMapLoaded(true);
  };

  // Update map markers based on sensors and alerts
  const updateMapMarkers = () => {
    if (!mapInstance || !markersLayer || !threatZonesLayer) return;
    const L = window.L;

    // Clear existing markers and zones
    markersLayer.clearLayers();
    threatZonesLayer.clearLayers();

    // Determine map bounds
    const bounds = L.latLngBounds([]);
    let hasBounds = false;

    // Add sensor markers
    sensors.forEach(sensor => {
      const { lat, lng } = sensor.location;
      bounds.extend([lat, lng]);
      hasBounds = true;

      // Skip if filtering by alerts or threats only
      if (activeLayer === "alerts" || activeLayer === "threats") return;

      // Determine marker color based on sensor status
      let markerColor = "green";
      if (sensor.status === "offline") markerColor = "red";
      if (sensor.status === "maintenance") markerColor = "orange";

      // Determine if this sensor has alerts
      const hasAlerts = alerts.some(
        alert => alert.sensorId === sensor.id && alert.status !== "resolved"
      );
      if (hasAlerts) markerColor = "red";

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${markerColor}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      // Create marker and add to layer
      const marker = L.marker([lat, lng], { icon })
        .addTo(markersLayer)
        .bindPopup(`
          <div>
            <h3>${sensor.name}</h3>
            <p>Status: ${sensor.status}</p>
            <p>Value: ${sensor.currentValue} ${sensor.unit}</p>
            <p>Location: ${sensor.location.description}</p>
          </div>
        `);
    });

    // Add threat zones
    alerts.forEach(alert => {
      // Skip if filtering by sensors only
      if (activeLayer === "all" || activeLayer === "alerts") return;

      const sensor = sensors.find(s => s.id === alert.sensorId);
      if (!sensor || alert.status === "resolved") return;

      // Determine threat zone radius based on severity
      let radius = 500; // meters
      if (alert.severity === "high") radius = 1000;
      if (alert.severity === "critical") radius = 2000;

      // Determine threat zone color based on severity
      let zoneColor = "#FFCC00"; // medium
      if (alert.severity === "high") zoneColor = "#FF6600";
      if (alert.severity === "critical") zoneColor = "#CC0000";

      // Create circle and add to layer
      const circle = L.circle([sensor.location.lat, sensor.location.lng], {
        color: zoneColor,
        fillColor: zoneColor,
        fillOpacity: 0.2,
        radius
      }).addTo(threatZonesLayer)
        .bindPopup(`
          <div>
            <h3>${alert.severity.toUpperCase()} Threat Zone</h3>
            <p>Sensor: ${sensor.name}</p>
            <p>Alert: ${alert.message}</p>
            <p>Status: ${alert.status}</p>
          </div>
        `);
    });

    // Add active alert markers
    alerts.forEach(alert => {
      // Skip if filtering by sensors or threats only
      if (activeLayer === "threats") return;

      const sensor = sensors.find(s => s.id === alert.sensorId);
      if (!sensor || alert.status === "resolved") return;

      // Only show alert markers when viewing alerts
      if (activeLayer === "alerts") {
        const { lat, lng } = sensor.location;
        bounds.extend([lat, lng]);
        hasBounds = true;

        // Determine marker color based on alert severity
        let markerColor = "#FFCC00"; // medium
        if (alert.severity === "high") markerColor = "#FF6600";
        if (alert.severity === "critical") markerColor = "#CC0000";

        // Create custom icon for alert
        const icon = L.divIcon({
          className: 'custom-alert-icon',
          html: `
            <div style="background-color: ${markerColor}; color: white; padding: 5px; border-radius: 50%; display: flex; justify-content: center; align-items: center; width: 24px; height: 24px; border: 2px solid white;">
              <span style="font-weight: bold; font-size: 14px;">!</span>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Create marker and add to layer
        const marker = L.marker([lat, lng], { icon })
          .addTo(markersLayer)
          .bindPopup(`
            <div>
              <h3>${alert.severity.toUpperCase()} Alert</h3>
              <p>Sensor: ${sensor.name}</p>
              <p>Message: ${alert.message}</p>
              <p>Status: ${alert.status}</p>
              <p>Time: ${alert.timestamp ? new Date(alert.timestamp).toLocaleString() : 'N/A'}</p>
            </div>
          `);
      }
    });

    // Fit map to bounds if we have markers
    if (hasBounds && bounds.isValid()) {
      mapInstance.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const handleLayerChange = (value: string) => {
    setActiveLayer(value as "all" | "alerts" | "threats");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-center mb-4">
        <ToggleGroup type="single" value={activeLayer} onValueChange={handleLayerChange}>
          <ToggleGroupItem value="all">All Sensors</ToggleGroupItem>
          <ToggleGroupItem value="alerts">Active Alerts</ToggleGroupItem>
          <ToggleGroupItem value="threats">Threat Zones</ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      {!mapLoaded ? (
        <div className="flex-1 rounded-md overflow-hidden">
          <Skeleton className="w-full h-full" />
        </div>
      ) : (
        <div id="map" className="flex-1 rounded-md overflow-hidden bg-muted" />
      )}
      
      <div className="mt-4 text-xs text-muted-foreground text-center">
        Map shows sensor locations, active alerts, and potential threat zones. Use the toggle to filter the view.
      </div>
    </div>
  );
}