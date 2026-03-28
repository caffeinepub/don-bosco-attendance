import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import CoursesPage from "./pages/CoursesPage";
import Dashboard from "./pages/Dashboard";
import LeaveManagement from "./pages/LeaveManagement";
import LoginPage from "./pages/LoginPage";
import MarkAttendance from "./pages/MarkAttendance";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import SetupPage from "./pages/SetupPage";
import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";

const queryClient = new QueryClient();

export type Page =
  | "dashboard"
  | "attendance"
  | "students"
  | "teachers"
  | "courses"
  | "leave"
  | "reports"
  | "notifications";

function AppInner() {
  const { identity, isInitializing, loginStatus } = useInternetIdentity();
  const { actor } = useActor();
  const [profileChecked, setProfileChecked] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    name: string;
    role: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const isAuthenticated = loginStatus === "success" && !!identity;

  useEffect(() => {
    if (isAuthenticated && actor) {
      actor
        .getCallerUserProfile()
        .then((profile) => {
          if (profile) {
            setUserProfile(profile);
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
          setProfileChecked(true);
        })
        .catch(() => setProfileChecked(true));
    } else if (!isAuthenticated && !isInitializing) {
      setProfileChecked(false);
      setHasProfile(false);
      setUserProfile(null);
    }
  }, [isAuthenticated, actor, isInitializing]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  if (!profileChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Checking profile...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <SetupPage
        onComplete={(profile) => {
          setUserProfile(profile);
          setHasProfile(true);
        }}
      />
    );
  }

  const isAdmin = userProfile?.role === "admin";

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "attendance":
        return <MarkAttendance />;
      case "students":
        return isAdmin ? <StudentsPage /> : <Dashboard />;
      case "teachers":
        return isAdmin ? <TeachersPage /> : <Dashboard />;
      case "courses":
        return isAdmin ? <CoursesPage /> : <Dashboard />;
      case "leave":
        return isAdmin ? <LeaveManagement /> : <Dashboard />;
      case "reports":
        return isAdmin ? <ReportsPage /> : <Dashboard />;
      case "notifications":
        return isAdmin ? <NotificationsPage /> : <Dashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      isAdmin={isAdmin}
      userName={userProfile?.name ?? "User"}
      userRole={userProfile?.role ?? "teacher"}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
