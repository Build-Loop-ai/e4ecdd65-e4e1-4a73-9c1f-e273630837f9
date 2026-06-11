import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminGuard } from "@/components/admin/AdminGuard";
import Index from "./pages/Index";

// Route-level code splitting: the landing page loads eagerly for fast first
// paint, every other page is fetched on demand.
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Demo = lazy(() => import("./pages/Demo"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardLaunch = lazy(() => import("./pages/DashboardLaunch"));
const Previews = lazy(() => import("./pages/Previews"));
const Analytics = lazy(() => import("./pages/Analytics"));
const NewPitch = lazy(() => import("./pages/NewPitch"));
const Preview = lazy(() => import("./pages/Preview"));
const Feedback = lazy(() => import("./pages/Feedback"));
const ManagePreview = lazy(() => import("./pages/ManagePreview"));
const Settings = lazy(() => import("./pages/Settings"));
const Leads = lazy(() => import("./pages/Leads"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

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
  <ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
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
              path="/dashboard/launch"
              element={
                <ProtectedRoute>
                  <DashboardLaunch />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
