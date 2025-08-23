"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Layout,
  FilePlus2,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { trackEvent, MixpanelEvent } from "@/utils/mixpanel";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export function SideNav() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const canChangeKeys = useSelector(
    (state: RootState) => state.userConfig.can_change_keys
  );

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Documents",
      href: "/documents",
      icon: FileText,
    },
    {
      title: "Templates",
      href: "/template-preview",
      icon: Layout,
    },
    {
      title: "Create Template",
      href: "/custom-template",
      icon: FilePlus2,
    },
    ...(canChangeKeys
      ? [
          {
            title: "Settings",
            href: "/settings",
            icon: Settings,
          },
        ]
      : []),
  ];

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-card h-[100dvh]",
        isCollapsed ? "w-16" : "w-64",
        "transition-all duration-300"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/90 transition-colors"
          >
            <span className="text-xl font-bold">PresentAI</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <ScrollArea className="flex-1 pt-4">
        <div className="space-y-2 px-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() =>
                trackEvent(MixpanelEvent.Navigation, {
                  from: pathname,
                  to: item.href,
                })
              }
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                pathname === item.href && "bg-muted text-primary",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
