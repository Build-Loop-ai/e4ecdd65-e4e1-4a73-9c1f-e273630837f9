import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Globe, ExternalLink, Copy, Trash2, MoreHorizontal, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { StatsCards } from '@/components/dashboard/StatsCards';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

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
    primaryColor: branding?.colors?.primary || 'hsl(var(--primary))',
  };
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
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

  const copyPreviewLink = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/preview/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Link copied',
      description: 'Preview link copied to clipboard.',
    });
  };

  const deletePreview = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'sent': return 'default';
      case 'feedback_received': return 'outline';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back. Here's what's happening with your previews.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsCards />

        {/* Recent Previews Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Recent Previews</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/previews" className="text-muted-foreground hover:text-foreground">
                View all
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-card">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : previews.length === 0 ? (
            <div className="p-12 rounded-xl border border-dashed border-border bg-muted/30 text-center">
              <Globe className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No previews yet</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
                Create your first client preview by entering their website URL.
              </p>
              <Button asChild>
                <Link to="/new-preview">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Preview
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {previews.slice(0, 6).map((preview) => {
                const data = extractPreviewData(preview);
                
                return (
                  <div
                    key={preview.id}
                    className="group p-4 rounded-xl border border-border bg-card hover:shadow-card hover:border-border/80 transition-all cursor-pointer"
                    onClick={() => navigate(`/manage/${preview.id}`)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo/Avatar */}
                      <div 
                        className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                        style={{ 
                          backgroundColor: data.heroImage ? undefined : 'hsl(var(--muted))',
                          backgroundImage: data.heroImage ? `url(${data.heroImage})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {!data.heroImage && (
                          <span className="text-sm font-semibold text-muted-foreground">
                            {data.companyName.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-medium text-foreground truncate">
                              {data.companyName}
                            </h3>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(preview.created_at)}
                            </p>
                          </div>
                          <Badge variant={getStatusVariant(preview.status)} className="text-[10px] h-5 flex-shrink-0">
                            {preview.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => { e.stopPropagation(); window.open(`/preview/${preview.slug}`, '_blank'); }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={(e) => copyPreviewLink(preview.slug, e)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => navigate(`/manage/${preview.id}`)}>
                                Manage
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`/preview/${preview.slug}`, '_blank'); }}>
                                <ExternalLink className="h-3.5 w-3.5 mr-2" />
                                Open preview
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={(e) => deletePreview(preview.id, e)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
