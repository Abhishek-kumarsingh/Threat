"use client";

import Link from "next/link";
import { CloudLightning } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardSidebarContent from "@/components/layout/dashboard-sidebar-content";

export default function DashboardSidebar() {
  return (
    <div className={cn(
      "hidden border-r bg-background md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-40"
    )}>
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <CloudLightning className="h-6 w-6 text-primary" />
          <span className="text-lg">EcoSentry</span>
        </Link>
      </div>
      <DashboardSidebarContent />
    </div>
  );
}