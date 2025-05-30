"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { SensorProvider } from "@/contexts/sensor-context";
import { AlertProvider } from "@/contexts/alert-context";
import DashboardNavbar from "@/components/layout/dashboard-navbar";
import DashboardSidebar from "@/components/layout/dashboard-sidebar";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <SensorProvider>
      <AlertProvider>
        <div className="flex h-screen overflow-hidden">
          <DashboardSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <DashboardNavbar />
            <main className="flex-1 overflow-auto bg-muted/40 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </AlertProvider>
    </SensorProvider>
  );
}