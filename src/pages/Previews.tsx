import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Plus, ExternalLink, Copy, Trash2, MoreHorizontal, Eye, Search, FileText, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { SendEmailDialog } from '@/components/email/SendEmailDialog';

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
    serviceCount: schema?.services?.length || 0,
    galleryCount: schema?.gallery?.images?.length || 0,
  };
};

export default function Previews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<ClientPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [emailDialogPreview, setEmailDialogPreview] = useState<ClientPreview | null>(null);
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
        title: 'Error loading pitches',
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
      description: 'Pitch link copied to clipboard.',
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
        title: 'Error deleting pitch',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreviews(previews.filter(p => p.id !== id));
      toast({
        title: 'Pitch deleted',
        description: 'The pitch has been removed.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-muted-foreground';
      case 'sent': return 'bg-primary';
      case 'feedback_received': return 'bg-success';
      default: return 'bg-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredPreviews = previews.filter(preview => {
    const data = extractPreviewData(preview);
    return data.companyName.toLowerCase().includes(search.toLowerCase()) ||
           preview.original_url.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Pitches</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage all your client pitches
            </p>
          </div>
          <Button asChild>
            <Link to="/new-preview">
              <Plus className="h-4 w-4 mr-2" />
              New Pitch
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search pitches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 max-w-sm"
          />
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : filteredPreviews.length === 0 ? (
          <div className="p-12 rounded-xl border border-dashed border-border bg-card text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {search ? 'No matching pitches' : 'Your first pitch is waiting'}
            </h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              {search 
                ? 'Try a different search term.'
                : 'Enter a prospect\'s website URL and create a stunning preview.'
              }
            </p>
            {!search && (
              <Button asChild>
                <Link to="/new-preview">
                  <Plus className="h-4 w-4 mr-2" />
                  New Pitch
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredPreviews.map((preview) => {
              const data = extractPreviewData(preview);
              
              return (
                <div
                  key={preview.id}
                  className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:shadow-card hover:border-border/80 transition-all cursor-pointer"
                  onClick={() => navigate(`/manage/${preview.id}`)}
                >
                  {/* Logo/Avatar */}
                  <div 
                    className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                    style={{ 
                      backgroundColor: data.heroImage ? undefined : 'hsl(var(--muted))',
                      backgroundImage: data.heroImage ? `url(${data.heroImage})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {!data.heroImage && (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {data.companyName.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">
                      {data.companyName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {preview.original_url}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                    {data.serviceCount > 0 && (
                      <span>{data.serviceCount} services</span>
                    )}
                    {data.galleryCount > 0 && (
                      <span>{data.galleryCount} images</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="hidden md:block text-sm text-muted-foreground">
                    {formatDate(preview.created_at)}
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(preview.status)}`} />
                    <span className="text-[10px] text-muted-foreground capitalize hidden sm:inline">
                      {preview.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); setEmailDialogPreview(preview); }}
                      title="Send pitch email"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); window.open(`/preview/${preview.slug}`, '_blank'); }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => copyPreviewLink(preview.slug, e)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
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
              );
            })}
          </div>
        )}
      </div>

      {/* Send Email Dialog */}
      {emailDialogPreview && (
        <SendEmailDialog
          open={!!emailDialogPreview}
          onOpenChange={(open) => { if (!open) setEmailDialogPreview(null); }}
          previewId={emailDialogPreview.id}
          previewUrl={`${window.location.origin}/preview/${emailDialogPreview.slug}`}
          recipientName={extractPreviewData(emailDialogPreview).companyName}
        />
      )}
    </DashboardLayout>
  );
}
