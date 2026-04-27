import { Routes, Route, Navigate } from "react-router-dom";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home/Home";
import LoginPage from "./pages/Auth/LoginPage";
import SignupPage from "./pages/Auth/SignupPage";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import OAuth2RedirectHandler from "./pages/Auth/OAuth2RedirectHandler";
import BookingList from "./pages/Booking/BookingList";
import CreateBooking from "./pages/Booking/CreateBooking";
import UpdateBooking from "./pages/Booking/UpdateBooking";
import BookingAdmin from "./pages/Booking/BookingAdmin";
import BookingCalendar from "./pages/Booking/BookingCalendar";
import QRCheckInPage from "./pages/Booking/QRCheckInPage";
import NotificationList from "./pages/Notification/NotificationList";
import UserManagement from "./pages/Admin/UserManagement";
import ResourceList from "./pages/Resource/ResourceList";
import AdminResourcePage from "./pages/Resource/AdminResourcePage";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MockScannerPage from "./pages/Booking/MockScannerPage";
import MockVerifyPage from "./pages/Booking/MockVerifyPage";

import CreateTicket from "./pages/Ticket/CreateTicket";
import MyTickets from "./pages/Ticket/MyTickets";
import TicketDetails from "./pages/Ticket/TicketDetails";
import AdminTickets from "./pages/Ticket/AdminTickets";
import TechnicianTickets from "./pages/Ticket/TechnicianTickets";
import AssignTechnician from "./pages/Ticket/AssignTechnician";
import UpdateTicketStatus from "./pages/Ticket/UpdateTicketStatus";
import TicketComments from "./pages/Ticket/TicketComments";
import AdminTicketDetails from "./pages/Ticket/AdminTicketDetails";
import EditTicket from "./pages/Ticket/EditTicket";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import TechnicianDashboard from "./pages/Dashboard/TechnicianDashboard";
import AdminRoleDashboard from "./pages/Dashboard/AdminRoleDashboard";
import AccountSettingsPage from "./pages/Dashboard/AccountSettingsPage";

function GuestRoute({ children }) {
  const { isAuthenticated, loading, user, getRoleDashboardPath } = useAuth();

  if (loading) return null;
  if (isAuthenticated) {
    return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
  }

  return children;
}

function RoleHomeRedirect() {
  const { loading, isAuthenticated, user, getRoleDashboardPath } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardPath(user?.role)} replace />;
}
function App() {
  return (
    <div className="app-shell">
      <Header />

      <main className="sc-page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />


          <Route path="/qr-verify/:id" element={<QRCheckInPage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <GuestRoute>
                <SignupPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <ForgotPasswordPage />
              </GuestRoute>
            }
          />
          <Route
            path="/reset-password"
            element={
              <GuestRoute>
                <ResetPasswordPage />
              </GuestRoute>
            }
          />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

          <Route path="/dashboard" element={<RoleHomeRedirect />} />
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute allowedRoles={["USER"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN"]}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminRoleDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <ResourceList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminResourcePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/calendar"
            element={
              <ProtectedRoute>
                <BookingCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateBooking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id/edit"
            element={
              <ProtectedRoute>
                <UpdateBooking />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin" replace />}
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <BookingAdmin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scanner-mock"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MockScannerPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/mock-verify/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <MockVerifyPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tickets/create"
            element={
              <ProtectedRoute>
                <CreateTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/my"
            element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/details/:id"
            element={
              <ProtectedRoute>
                <TicketDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/edit/:id"
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <EditTicket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/admin"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/technician"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN", "ADMIN"]}>
                <TechnicianTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/assign/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AssignTechnician />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/update-status/:id"
            element={
              <ProtectedRoute allowedRoles={["TECHNICIAN", "ADMIN"]}>
                <UpdateTicketStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/comments/:id"
            element={
              <ProtectedRoute>
                <TicketComments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/admin/details/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminTicketDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
