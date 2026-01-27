import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Globe, ExternalLink, MessageSquare, LogOut, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [previews, setPreviews] = useState<ClientPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreviews();
  }, []);

  const fetchPreviews = async () => {
    const { data, error } = await supabase
      .from('client_previews')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading previews',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreviews(data || []);
    }
    setLoading(false);
  };

  const copyPreviewLink = (slug: string) => {
    const url = `${window.location.origin}/preview/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied!',
      description: 'Share this link with your client.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'default';
      case 'feedback_received':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">PreviewPro</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Client Previews</h1>
            <p className="text-muted-foreground">
              Create and manage website previews for your clients
            </p>
          </div>
          <Button asChild>
            <Link to="/new-preview">
              <Plus className="h-4 w-4 mr-2" />
              New Preview
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : previews.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No previews yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first client preview to get started
              </p>
              <Button asChild>
                <Link to="/new-preview">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Preview
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => (
              <Card key={preview.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{preview.client_name}</CardTitle>
                      <CardDescription className="truncate max-w-[200px]">
                        {preview.original_url}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusColor(preview.status)}>
                      {preview.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyPreviewLink(preview.slug)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy Link
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/preview/${preview.slug}`} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/feedback/${preview.id}`}>
                        <MessageSquare className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
