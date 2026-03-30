import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GraduationCap,
  Loader2,
  LogOut,
  ShieldCheck,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { UserRole } from "./backend.d";
import { AdminDashboard } from "./components/AdminDashboard";
import { LoginPage } from "./components/LoginPage";
import { UserDashboard } from "./components/UserDashboard";
import { useActor } from "./hooks/useActor";

export default function App() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);

  const { data: role, isLoading: roleLoading } = useQuery<UserRole>({
    queryKey: ["userRole"],
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && loggedIn,
    staleTime: 30000,
  });

  const loginMutation = useMutation({
    mutationFn: async (secret: string) => {
      if (!actor) throw new Error("Not connected to backend");
      await actor.initializeAccessControl(secret);
      return actor.getCallerUserRole();
    },
    onSuccess: (fetchedRole) => {
      queryClient.setQueryData(["userRole"], fetchedRole);
      setLoggedIn(true);
      setLoginError(null);
      toast.success(
        `Signed in as ${fetchedRole === "admin" ? "Administrator" : "User"}`,
      );
    },
    onError: (err) => {
      setLoginError(
        err instanceof Error ? err.message : "Login failed. Please try again.",
      );
    },
  });

  const handleLogin = useCallback(
    async (secret: string) => {
      setLoginError(null);
      loginMutation.mutate(secret);
    },
    [loginMutation],
  );

  const handleLogout = () => {
    setLoggedIn(false);
    queryClient.clear();
    toast.info("Signed out");
  };

  // Show login if not logged in or role is guest
  const isAuthenticated = loggedIn && role && role !== "guest";

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage
          onLogin={handleLogin}
          isLoading={loginMutation.isPending}
          error={loginError}
        />
        <Toaster />
      </>
    );
  }

  const isAdmin = role === "admin";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sidebar-primary/20 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                College Gate Pass
              </h1>
              <p className="text-xs text-sidebar-foreground/60">
                Management System
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {isAdmin ? (
            <>
              <NavItem icon={ShieldCheck} label="Dashboard" active />
              <NavItem icon={GraduationCap} label="All Passes" />
            </>
          ) : (
            <>
              <NavItem icon={User} label="My Passes" active />
              <NavItem icon={GraduationCap} label="Request Pass" />
            </>
          )}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              {isAdmin ? (
                <ShieldCheck className="h-4 w-4 text-white" />
              ) : (
                <User className="h-4 w-4 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {isAdmin ? "Administrator" : "Student / Guard"}
              </p>
              <p className="text-xs text-sidebar-foreground/50">Role: {role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-sidebar-foreground/70 hover:text-white hover:bg-sidebar-accent"
            onClick={handleLogout}
            data-ocid="nav.button"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-card border-b px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {isAdmin ? "Admin Dashboard" : "Student Dashboard"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isAdmin
                ? "Manage and approve student gate pass requests"
                : "Request and track your gate passes"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {roleLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                isAdmin
                  ? "bg-primary/10 text-primary"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {isAdmin ? (
                <ShieldCheck className="h-3 w-3" />
              ) : (
                <User className="h-3 w-3" />
              )}
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {isAdmin ? <AdminDashboard /> : <UserDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="border-t px-8 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-red-500">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </footer>
      </main>

      <Toaster />
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors cursor-default ${
        active
          ? "bg-sidebar-accent text-white font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-white"
      }`}
      data-ocid="nav.link"
    >
      <Icon className="h-4 w-4" />
      {label}
    </div>
  );
}
