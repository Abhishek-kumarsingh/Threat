"use client";

import { useAuth } from "@/contexts/auth-context";
import { AdminDashboard } from "../../src/components/dashboard/AdminDashboard";
import { UserDashboard } from "../../src/components/dashboard/UserDashboard";
import { OperatorDashboard } from "../../src/components/dashboard/OperatorDashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Shield, Activity, Users } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to access the dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'operator':
      return <OperatorDashboard />;
    case 'user':
      return <UserDashboard />;
    default:
      return (
        <div className="flex items-center justify-center h-screen">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Invalid user role. Please contact your administrator.
            </AlertDescription>
          </Alert>
        </div>
      );
  }
}