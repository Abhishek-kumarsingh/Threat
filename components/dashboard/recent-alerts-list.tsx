"use client";

import { useAlerts } from "@/contexts/alert-context";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

type RecentAlertsListProps = {
  showAll?: boolean;
};

export default function RecentAlertsList({ showAll = false }: RecentAlertsListProps) {
  const { alerts, loading, acknowledgeAlert, resolveAlert } = useAlerts();

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center">
        <CheckCircle2 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No active alerts</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "high":
        return "bg-destructive/80 text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge variant="outline" className="bg-destructive/10 text-destructive">
            <AlertTriangle className="h-3 w-3 mr-1" />
            New
          </Badge>
        );
      case "acknowledged":
        return (
          <Badge variant="outline" className="bg-warning/10 text-warning">
            <Clock className="h-3 w-3 mr-1" />
            Acknowledged
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-success/10 text-success">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  // Sort alerts by timestamp (newest first) and status (new first, then acknowledged, then resolved)
  const sortedAlerts = [...alerts].sort((a, b) => {
    // First sort by status priority
    const statusPriority = { new: 0, acknowledged: 1, resolved: 2 };
    const statusDiff = statusPriority[a.status] - statusPriority[b.status];
    if (statusDiff !== 0) return statusDiff;
    
    // Then by timestamp (newest first)
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Limit to 5 most recent alerts unless showAll is true
  const displayAlerts = showAll ? sortedAlerts : sortedAlerts.slice(0, 5);

  return (
    <ScrollArea className={cn("pr-4", showAll ? "h-[500px]" : "h-[250px]")}>
      <div className="space-y-4">
        {displayAlerts.map((alert) => (
          <div key={alert.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge className={getSeverityColor(alert.severity)}>
                  {alert.severity}
                </Badge>
                {getStatusBadge(alert.status)}
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(alert.timestamp).toLocaleTimeString()} - {new Date(alert.timestamp).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm font-medium">{alert.message}</div>
            <div className="text-xs text-muted-foreground">
              Sensor: {alert.sensorName}
            </div>
            
            {showAll && (
              <div className="flex items-center gap-2 mt-2">
                {alert.status === "new" && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                )}
                {(alert.status === "new" || alert.status === "acknowledged") && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                )}
                <Button variant="ghost" size="sm" className="ml-auto">
                  Details
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}