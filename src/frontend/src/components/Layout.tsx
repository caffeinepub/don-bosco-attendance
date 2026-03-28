import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarOff,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
  X,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import type { Page } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface NavItem {
  id: Page;
  label: string;
  icon: ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  {
    id: "attendance",
    label: "Mark Attendance",
    icon: <ClipboardCheck size={18} />,
  },
  {
    id: "students",
    label: "Students",
    icon: <Users size={18} />,
    adminOnly: true,
  },
  {
    id: "teachers",
    label: "Teachers",
    icon: <GraduationCap size={18} />,
    adminOnly: true,
  },
  {
    id: "courses",
    label: "Courses",
    icon: <BookOpen size={18} />,
    adminOnly: true,
  },
  {
    id: "leave",
    label: "Leave / OD",
    icon: <CalendarOff size={18} />,
    adminOnly: true,
  },
  {
    id: "reports",
    label: "Reports",
    icon: <BarChart3 size={18} />,
    adminOnly: true,
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell size={18} />,
    adminOnly: true,
  },
];

interface Props {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
  userName: string;
  userRole: string;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
  isAdmin,
  userName,
  userRole,
}: Props) {
  const { clear } = useInternetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-sidebar-border">
        <h2 className="font-bold text-sm text-foreground leading-tight">
          Don Bosco College
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">of Agriculture</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {visibleItems.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => {
              onNavigate(item.id);
              setSidebarOpen(false);
            }}
            data-ocid={`nav.${item.id}.link`}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
              currentPage === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: "oklch(0.32 0.10 245)" }}
          >
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {userName}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {userRole}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
          onClick={() => clear()}
          data-ocid="nav.logout.button"
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Header */}
      <header
        className="h-14 flex items-center justify-between px-4 md:px-6 text-white flex-shrink-0"
        style={{ backgroundColor: "oklch(0.32 0.10 245)" }}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-semibold text-sm md:text-base">
            Don Bosco College of Agriculture{" "}
            <span className="opacity-60 font-normal">| AMS</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-80 hidden sm:block">{userName}</span>
          <button
            type="button"
            onClick={() => clear()}
            className="text-sm opacity-70 hover:opacity-100 transition-opacity"
            data-ocid="header.logout.button"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            role="button"
            tabIndex={0}
            aria-label="Close sidebar"
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "w-60 flex-shrink-0 bg-sidebar border-r border-sidebar-border overflow-y-auto",
            "fixed md:relative z-30 md:z-auto top-14 md:top-0 bottom-0 left-0",
            "transition-transform duration-200",
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0",
          )}
        >
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}

          {/* Footer */}
          <footer className="mt-10 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              caffeine.ai
            </a>
          </footer>
        </main>
      </div>
    </div>
  );
}
