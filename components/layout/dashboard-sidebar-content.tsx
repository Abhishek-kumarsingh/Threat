"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Gauge, AlertTriangle, FileBarChart, Settings, MapPin, Users, Shield, ChevronDown, DivideIcon as LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
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

  return (
    <Link href={href} className="w-full">
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-2",
          isActive ? "bg-muted" : "hover:bg-muted/50"
        )}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
        {badge && (
          <span className="ml-auto text-xs bg-primary/15 text-primary py-0.5 px-1.5 rounded-md">
            {badge}
          </span>
        )}
      </Button>
    </Link>
  );
}

function NavGroup({ title, icon: Icon, items }: { title: string; icon: LucideIcon; items: { href: string; title: string; badge?: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isAnyActive = items.some(item => pathname === item.href);

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

  return (
    <div className="flex flex-col gap-1 py-4 overflow-auto">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
          Overview
        </h2>
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
        </div>
      </div>
      
      {isAdmin && (
        <div className="px-3 py-2">
          <h2 className="mb-2 px-3 text-xs font-semibold text-muted-foreground">
            Admin
          </h2>
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
      
      <div className="px-3 py-2 mt-auto">
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