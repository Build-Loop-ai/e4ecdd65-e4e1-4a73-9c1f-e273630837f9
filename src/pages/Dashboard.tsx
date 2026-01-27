import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Globe, ExternalLink, MessageSquare, LogOut, Copy, Trash2, Calendar, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

// Extract data from preview for display
const extractPreviewData = (preview: ClientPreview) => {
  const schema = preview.processed_schema as any;
  const branding = preview.brand_colors as any;
  
  return {
    companyName: schema?.companyName || preview.client_name,
    headline: schema?.hero?.headline || 'No headline',
    heroImage: schema?.hero?.backgroundImages?.[0] || null,
    logo: branding?.logo || branding?.images?.logo || schema?.logo || null,
    primaryColor: branding?.colors?.primary || '#3b82f6',
    secondaryColor: branding?.colors?.secondary || '#1e293b',
    serviceCount: schema?.services?.length || 0,
    galleryCount: schema?.gallery?.images?.length || 0,
  };
};

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

  const deletePreview = async (id: string) => {
    const { error } = await supabase
      .from('client_previews')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error deleting preview',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreviews(previews.filter(p => p.id !== id));
      toast({
        title: 'Preview deleted',
        description: 'The preview has been removed.',
      });
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
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
              {previews.length} preview{previews.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/new-preview">
              <Plus className="h-4 w-4 mr-2" />
              New Preview
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-40 w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : previews.length === 0 ? (
          <Card className="text-center py-16 bg-muted/30 border-dashed">
            <CardContent>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No previews yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first client preview by entering their website URL. We'll automatically extract their branding and content.
              </p>
              <Button asChild size="lg">
                <Link to="/new-preview">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Preview
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {previews.map((preview) => {
              const data = extractPreviewData(preview);
              
              return (
                <Card 
                  key={preview.id} 
                  className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30"
                >
                  {/* Visual Preview Header */}
                  <div 
                    className="h-44 relative overflow-hidden"
                    style={{
                      background: data.heroImage 
                        ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url(${data.heroImage}) center/cover`
                        : `linear-gradient(135deg, ${data.secondaryColor} 0%, ${data.primaryColor}66 100%)`
                    }}
                  >
                    {/* Logo */}
                    <div className="absolute top-4 left-4">
                      {data.logo ? (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
                          <img 
                            src={data.logo} 
                            alt={data.companyName}
                            className="h-8 w-auto max-w-[100px] object-contain"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        </div>
                      ) : (
                        <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                          <span className="text-white font-bold text-sm">
                            {data.companyName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <Badge variant={getStatusColor(preview.status)} className="capitalize">
                        {preview.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Headline Preview */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white/70 text-xs mb-1 uppercase tracking-wide">
                        {preview.template_id === 'modern-professional' ? 'Modern' : 'Classic'}
                      </p>
                      <h3 className="text-white font-bold text-lg leading-tight line-clamp-2">
                        {data.headline.length > 50 ? data.headline.slice(0, 50) + '...' : data.headline}
                      </h3>
                    </div>

                    {/* Brand Colors Strip */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 flex">
                      <div className="flex-1" style={{ backgroundColor: data.primaryColor }} />
                      <div className="flex-1" style={{ backgroundColor: data.secondaryColor }} />
                    </div>
                  </div>

                  {/* Card Content */}
                  <CardContent className="p-4">
                    {/* Company Name & URL */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-lg">{data.companyName}</h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {preview.original_url}
                      </p>
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(preview.created_at)}
                      </div>
                      {data.serviceCount > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{data.serviceCount} services</span>
                        </div>
                      )}
                      {data.galleryCount > 0 && (
                        <div className="flex items-center gap-1">
                          <span>{data.galleryCount} images</span>
                        </div>
                      )}
                    </div>

                    {/* Color Palette Preview */}
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="h-3 w-3 text-muted-foreground" />
                      <div className="flex gap-1">
                        <div 
                          className="w-5 h-5 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: data.primaryColor }}
                          title={`Primary: ${data.primaryColor}`}
                        />
                        <div 
                          className="w-5 h-5 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: data.secondaryColor }}
                          title={`Secondary: ${data.secondaryColor}`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        asChild
                      >
                        <Link to={`/preview/${preview.slug}`} target="_blank">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyPreviewLink(preview.slug)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/feedback/${preview.id}`}>
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => deletePreview(preview.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
