import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Layers,
  LayoutDashboard,
  Loader2,
  LogIn,
  LogOut,
  Plus,
  Zap,
} from "lucide-react";
import type { AppPage } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface SidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

const navItems = [
  { id: "dashboard" as AppPage, icon: LayoutDashboard, label: "Dashboard" },
  { id: "studio" as AppPage, icon: Plus, label: "New Video" },
  { id: "templates" as AppPage, icon: Layers, label: "Templates" },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const isLoggedIn = !!identity;
  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal ? `${principal.slice(0, 5)}...` : "";

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-surface-1 border-r border-border h-full">
      {/* Logo */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-foreground text-sm leading-none">
              AI Video
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-none">
              Creator Studio
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border mx-4 mb-3" />

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1" data-ocid="sidebar.panel">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              type="button"
              key={item.id}
              data-ocid={`sidebar.${item.id}.link`}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-purple/10 text-purple border border-purple/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-4",
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom: user */}
      <div className="p-3 border-t border-border">
        {isInitializing ? (
          <div className="flex items-center gap-3 px-3 py-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : isLoggedIn ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 px-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="gradient-brand text-white text-xs font-bold">
                  {shortPrincipal.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="text-xs font-medium text-foreground truncate">
                  Creator
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {shortPrincipal}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              data-ocid="sidebar.logout.button"
              onClick={() => clear()}
              className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive h-8 text-xs px-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            data-ocid="sidebar.login.button"
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full gradient-brand text-white hover:opacity-90 h-9 text-xs font-semibold"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <LogIn className="w-3.5 h-3.5 mr-1.5" />
                Sign In
              </>
            )}
          </Button>
        )}
      </div>
    </aside>
  );
}
