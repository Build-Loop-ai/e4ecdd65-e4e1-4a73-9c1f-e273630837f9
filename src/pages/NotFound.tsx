import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { PitchLogo } from "@/components/ui/PitchLogo";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border px-6 py-4">
        <PitchLogo size="md" />
      </header>

      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center space-y-6 max-w-md">
          <p className="text-8xl font-bold text-primary">404</p>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
            <p className="text-muted-foreground">
              The page <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">{location.pathname}</code> doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Go back
            </Button>
            <Button size="sm" asChild>
              <Link to="/dashboard">
                <Home className="mr-1.5 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
