import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Previews from "./pages/Previews";
import Analytics from "./pages/Analytics";

import NewPitch from "./pages/NewPitch";
import Preview from "./pages/Preview";
import Feedback from "./pages/Feedback";
import ManagePreview from "./pages/ManagePreview";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import Admin from "./pages/Admin";
import { AdminGuard } from "@/components/admin/AdminGuard";

const queryClient = new QueryClient();

const LegacyPreviewRedirect = () => {
  const { userPrefix, clientSlug } = useParams<{ userPrefix: string; clientSlug: string }>();
  if (!userPrefix || !clientSlug) return <Navigate to="/" replace />;
  return <Navigate to={`/${userPrefix}/${clientSlug}`} replace />;
};

// Legacy redirect for /settings → /dashboard/settings
const LegacySettingsRedirect = () => {
  return <Navigate to="/dashboard/settings" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/previews"
              element={
                <ProtectedRoute>
                  <Previews />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/leads"
              element={
                <ProtectedRoute>
                  <Leads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/new"
              element={
                <ProtectedRoute>
                  <NewPitch />
                </ProtectedRoute>
              }
            />
            {/* Legacy redirect */}
            <Route path="/new-preview" element={<Navigate to="/dashboard/new" replace />} />
            <Route
              path="/feedback/:previewId"
              element={
                <ProtectedRoute>
                  <Feedback />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage/:id"
              element={
                <ProtectedRoute>
                  <ManagePreview />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                </ProtectedRoute>
              }
            />
            {/* Legacy redirects */}
            <Route path="/settings" element={<LegacySettingsRedirect />} />
            <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
             {/* Back-compat: users sometimes copy /preview/{userPrefix}/{clientSlug} */}
             <Route path="/preview/:userPrefix/:clientSlug" element={<LegacyPreviewRedirect />} />
            {/* New URL structure: /:userPrefix/:clientSlug */}
            <Route path="/:userPrefix/:clientSlug" element={<Preview />} />
            {/* Legacy support for old slugs */}
            <Route path="/preview/:slug" element={<Preview />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
