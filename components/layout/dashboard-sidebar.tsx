"use client";

import Link from "next/link";
import { CloudLightning, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/contexts/sidebar-context";
import DashboardSidebarContent from "@/components/layout/dashboard-sidebar-content";

export default function DashboardSidebar() {
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <div className={cn(
      "hidden border-r bg-background md:flex md:flex-col md:fixed md:inset-y-0 z-40 transition-all duration-300",
      isCollapsed ? "md:w-16" : "md:w-60"
    )}>
      <div className={cn(
        "flex h-16 items-center border-b transition-all duration-300",
        isCollapsed ? "justify-center px-2" : "justify-between px-6"
      )}>
        <Link href="/dashboard" className={cn(
          "flex items-center gap-2 font-semibold transition-all duration-300",
          isCollapsed && "justify-center"
        )}>
          <CloudLightning className="h-6 w-6 text-primary flex-shrink-0" />
          {!isCollapsed && <span className="text-lg">EcoSentry</span>}
        </Link>

        {!isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isCollapsed && (
        <div className="flex justify-center p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <DashboardSidebarContent />
    </div>
  );
}