import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Previews from "./pages/Previews";
import Analytics from "./pages/Analytics";
import NewPreview from "./pages/NewPreview";
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
            <Route
              path="/new-preview"
              element={
                <ProtectedRoute>
                  <NewPreview />
                </ProtectedRoute>
              }
            />
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
              path="/dashboard/admin"
              element={
                <ProtectedRoute>
                  <AdminGuard>
                    <Admin />
                  </AdminGuard>
                </ProtectedRoute>
              }
            />
            {/* Legacy redirect: /settings → /dashboard/settings */}
            <Route path="/settings" element={<LegacySettingsRedirect />} />
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
