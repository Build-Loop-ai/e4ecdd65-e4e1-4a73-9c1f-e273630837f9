import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4">
      <div className="text-center max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Globe className="h-12 w-12 text-primary" />
          <span className="text-4xl font-bold">PreviewPro</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Win Clients with Stunning Website Previews
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Scrape any website, let AI organize the content, and show your clients exactly how their new site could look.
        </p>
        {!loading && (
          <Button size="lg" asChild>
            <Link to={user ? "/dashboard" : "/auth"}>
              {user ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};

export default Index;
