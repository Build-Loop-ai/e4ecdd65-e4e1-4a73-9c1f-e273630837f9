import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PitchLogo } from '@/components/ui/PitchLogo';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <PitchLogo size="md" />
        {!loading && (
          <Button variant="ghost" asChild>
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </Button>
        )}
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            <span>Win more clients</span>
            <ArrowRight className="h-4 w-4" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight mb-6">
            Pitch perfect.
            <br />
            <span className="text-primary">Every time.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Show prospects exactly how their new website could look. Scrape their current site, let AI organize the content, and send a stunning preview that closes deals.
          </p>
          
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="px-8">
                <Link to={user ? "/dashboard" : "/auth"}>
                  {user ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              {!user && (
                <Button size="lg" variant="outline" asChild className="px-8">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Win clients with stunning website previews</p>
      </footer>
    </div>
  );
};

export default Index;
