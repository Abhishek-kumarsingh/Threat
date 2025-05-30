"use client";

import { useSensors } from "@/contexts/sensor-context";
import { Check, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SensorStatusOverview() {
  const { sensors, loading } = useSensors();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (sensors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <p className="text-muted-foreground">No sensors available</p>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <Check className="h-4 w-4" />;
      case "offline":
        return <AlertTriangle className="h-4 w-4" />;
      case "maintenance":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-success/10 text-success hover:bg-success/20";
      case "offline":
        return "bg-destructive/10 text-destructive hover:bg-destructive/20";
      case "maintenance":
        return "bg-warning/10 text-warning hover:bg-warning/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getSensorValue = (sensor: any) => {
    // Format the value based on threshold
    const value = sensor.currentValue;
    const { warning, critical } = sensor.thresholds;
    
    if (value >= critical) {
      return <span className="font-bold text-destructive">{value} {sensor.unit}</span>;
    } else if (value >= warning) {
      return <span className="font-bold text-warning">{value} {sensor.unit}</span>;
    } else {
      return <span>{value} {sensor.unit}</span>;
    }
  };

  return (
    <ScrollArea className="h-[250px] pr-4">
      <div className="space-y-4">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="flex items-center justify-between">
            <div>
              <div className="font-medium">{sensor.name}</div>
              <div className="text-sm text-muted-foreground">
                {sensor.location.description} • {getSensorValue(sensor)}
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1 capitalize",
                getStatusColor(sensor.status)
              )}
            >
              {getStatusIcon(sensor.status)}
              {sensor.status}
            </Badge>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}