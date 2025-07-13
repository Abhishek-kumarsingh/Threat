"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gauge, AlertTriangle, FileBarChart, Settings, MapPin, Users, Shield, ChevronDown, Network, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/auth-context";
import { useSidebar } from "@/contexts/sidebar-context";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
  badge?: string;
}

function NavItem({ href, icon: Icon, title, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;
  const { isCollapsed } = useSidebar();

  const buttonContent = (
    <Button
      variant={isActive ? "secondary" : "ghost"}
      className={cn(
        "w-full gap-2",
        isCollapsed ? "justify-center px-2" : "justify-start",
        isActive ? "bg-muted" : "hover:bg-muted/50"
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span>{title}</span>
          {badge && (
            <span className="ml-auto text-xs bg-primary/15 text-primary py-0.5 px-1.5 rounded-md">
              {badge}
            </span>
          )}
        </>
      )}
    </Button>
  );

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href} className="w-full">
              {buttonContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={href} className="w-full">
      {buttonContent}
    </Link>
  );
}

function NavGroup({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: { href: string; title: string; badge?: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAnyActive = items.some(item => pathname === item.href);
  const { isCollapsed } = useSidebar();

  // In collapsed mode, show as individual nav items with tooltips
  if (isCollapsed) {
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <NavItem
            key={index}
            href={item.href}
            icon={Icon}
            title={item.title}
            badge={item.badge}
          />
        ))}
      </div>
    );
  }

  return (
    <Collapsible
      open={isOpen || isAnyActive}
      onOpenChange={setIsOpen}
      className="w-full"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-2",
            (isOpen || isAnyActive) && "bg-muted/50"
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{title}</span>
          <ChevronDown
            className={cn(
              "ml-auto h-4 w-4 transition-transform",
              (isOpen || isAnyActive) && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-6 space-y-1 pt-1">
        {items.map((item, index) => (
          <Link key={index} href={item.href} className="w-full">
            <Button
              variant={pathname === item.href ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                pathname === item.href ? "bg-muted" : "hover:bg-muted/50"
              )}
              size="sm"
            >
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-primary/15 text-primary py-0.5 px-1.5 rounded-md">
                  {item.badge}
                </span>
              )}
            </Button>
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function DashboardSidebarContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex flex-col gap-1 py-4 overflow-auto">
      <div className={cn("px-3 py-2", isCollapsed && "px-2")}>
        {!isCollapsed && (
          <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Overview
          </h2>
        )}
        <div className="space-y-1">
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            title="Dashboard"
          />
          <NavGroup
            title="Sensors"
            icon={Gauge}
            items={[
              { href: "/dashboard/sensors", title: "All Sensors" },
              { href: "/dashboard/sensors/create", title: "Add Sensor" },
              { href: "/dashboard/sensors/thresholds", title: "Thresholds" },
            ]}
          />
          <NavGroup
            title="Alerts"
            icon={AlertTriangle}
            items={[
              { href: "/dashboard/alerts", title: "Active Alerts", badge: "3" },
              { href: "/dashboard/alerts/history", title: "Alert History" },
              { href: "/dashboard/alerts/settings", title: "Alert Settings" },
            ]}
          />
          <NavItem
            href="/dashboard/threat-zones"
            icon={MapPin}
            title="Threat Zones"
          />
          <NavItem
            href="/dashboard/reports"
            icon={FileBarChart}
            title="Reports"
          />
          <NavItem
            href="/dashboard/system-architecture"
            icon={Network}
            title="System Architecture"
          />
        </div>
      </div>

      {isAdmin && (
        <div className={cn("px-3 py-2", isCollapsed && "px-2")}>
          {!isCollapsed && (
            <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
              Admin
            </h2>
          )}
          <div className="space-y-1">
            <NavItem
              href="/dashboard/users"
              icon={Users}
              title="User Management"
            />
            <NavItem
              href="/dashboard/security"
              icon={Shield}
              title="Security"
            />
          </div>
        </div>
      )}

      <div className={cn("px-3 py-2 mt-auto", isCollapsed && "px-2")}>
        <div className="space-y-1">
          <NavItem
            href="/dashboard/settings"
            icon={Settings}
            title="Settings"
          />
        </div>
      </div>
    </div>
  );
}