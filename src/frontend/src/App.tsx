import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Layout from "./components/Layout";
import { useSimpleAuth } from "./hooks/useSimpleAuth";
import CoursesPage from "./pages/CoursesPage";
import Dashboard from "./pages/Dashboard";
import LeaveManagement from "./pages/LeaveManagement";
import LoginPage from "./pages/LoginPage";
import MarkAttendance from "./pages/MarkAttendance";
import NotificationsPage from "./pages/NotificationsPage";
import ReportsPage from "./pages/ReportsPage";
import StudentsPage from "./pages/StudentsPage";
import TeachersPage from "./pages/TeachersPage";

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
  const { user, isAuthenticated } = useSimpleAuth();
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const isAdmin = user.role === "admin";

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
      userName={user.name}
      userRole={user.role}
    >
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <>
      <AppInner />
      <Toaster richColors position="top-right" />
    </>
  );
}
