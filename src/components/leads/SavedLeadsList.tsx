import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Globe, 
  Phone, 
  Mail, 
  Star,
  Plus,
  MoreHorizontal,
  Trash2,
  Loader2,
  Users,
  Send
} from 'lucide-react';
import { GlowIcon } from '@/components/ui/GlowIcon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LeadFilters } from './LeadFilters';
import { BulkActionsBar } from './BulkActionsBar';
import { SendEmailDialog } from '@/components/email/SendEmailDialog';
import { useLeads, type SavedLead } from '@/hooks/useLeads';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  pitched: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  converted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
};

export function SavedLeadsList() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    savedLeads,
    isLoading,
    filters,
    setFilters,
    sort,
    setSort,
    filterOptions,
    deleteLeads,
    isDeleting,
  } = useLeads();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [creatingPitchId, setCreatingPitchId] = useState<string | null>(null);
  const [emailDialogLead, setEmailDialogLead] = useState<SavedLead | null>(null);
  const [isBulkSending, setIsBulkSending] = useState(false);

  // Get already-emailed lead IDs to calculate unsent count
  const { data: emailedLeadIds = new Set<string>() } = useQuery({
    queryKey: ['emailed-lead-ids', user?.id],
    queryFn: async () => {
      if (!user?.id) return new Set<string>();
      const { data } = await supabase
        .from('outreach_emails')
        .select('lead_id')
        .eq('user_id', user.id);
      return new Set((data || []).map((e: any) => e.lead_id).filter(Boolean) as string[]);
    },
    enabled: !!user?.id,
  });

  const unsentCount = useMemo(() => {
    return savedLeads.filter(l => l.email && l.preview_id && !emailedLeadIds.has(l.id)).length;
  }, [savedLeads, emailedLeadIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(savedLeads.map(l => l.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;
    
    try {
      await deleteLeads(Array.from(selectedIds));
      setSelectedIds(new Set());
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCreatePitch = async (lead: SavedLead) => {
    if (!lead.website_url) {
      toast({ 
        title: 'No website available', 
        description: 'This business does not have a website to create a pitch from',
        variant: 'destructive' 
      });
      return;
    }

    setCreatingPitchId(lead.id);

    try {
      // Update lead status to pitched
      await supabase
        .from('leads')
        .update({ status: 'pitched' })
        .eq('id', lead.id)
        .eq('user_id', user!.id);

      // Navigate to new pitch page
      navigate('/dashboard/new', { 
        state: { 
          prefilledUrl: lead.website_url,
          leadId: lead.id,
          clientName: lead.business_name
        } 
      });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: 'Failed to create pitch',
        variant: 'destructive' 
      });
    } finally {
      setCreatingPitchId(null);
    }
  };

  const handleDeleteSingle = async (id: string) => {
    try {
      await deleteLeads([id]);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleBulkSend = async () => {
    setIsBulkSending(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast({ title: 'Not authenticated', variant: 'destructive' });
        return;
      }

      const response = await supabase.functions.invoke('auto-outreach', {
        body: { mode: 'bulk' },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Bulk send failed');
      }

      const result = response.data;
      if (result.error) {
        toast({ title: 'Bulk send failed', description: result.error, variant: 'destructive' });
      } else {
        toast({ 
          title: `Sent ${result.sent} email${result.sent !== 1 ? 's' : ''}`,
          description: result.failed > 0 ? `${result.failed} failed` : undefined,
        });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsBulkSending(false);
    }
  };

  const selectedWithWebsites = savedLeads.filter(
    l => selectedIds.has(l.id) && l.website_url
  ).length;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[140px]" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFiltersChange={setFilters}
        sort={sort}
        onSortChange={setSort}
        cities={filterOptions.cities}
        categories={filterOptions.categories}
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        totalCount={savedLeads.length}
        onSelectAll={selectAll}
        onDeselectAll={deselectAll}
        onDelete={handleDelete}
        onCreatePitches={() => {
          const firstWithWebsite = savedLeads.find(
            l => selectedIds.has(l.id) && l.website_url
          );
          if (firstWithWebsite) {
            handleCreatePitch(firstWithWebsite);
          }
        }}
        onBulkSend={handleBulkSend}
        isDeleting={isDeleting}
        isSending={isBulkSending}
        hasWebsites={selectedWithWebsites > 0}
        unsentCount={unsentCount}
      />

      {/* Empty State */}
      {savedLeads.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 w-fit"><GlowIcon icon={Users} variant="muted" size="lg" /></div>
            <h3 className="text-lg font-medium mb-2">No saved leads yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for businesses in the Search tab and save them to build your lead list.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lead List */}
      <div className="space-y-2">
        {savedLeads.map((lead) => (
          <Card key={lead.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={selectedIds.has(lead.id)}
                  onCheckedChange={() => toggleSelect(lead.id)}
                />

                {/* Main Content */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Business Info */}
                  <div className="md:col-span-1">
                    <h4 className="font-medium text-foreground line-clamp-1">
                      {lead.business_name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      {lead.rating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {Number(lead.rating).toFixed(1)}
                        </span>
                      )}
                      {lead.city && (
                        <span>· {lead.city}</span>
                      )}
                    </div>
                  </div>

                  {/* Contact Icons */}
                  <div className="md:col-span-1 flex items-center gap-3 text-muted-foreground">
                    {lead.website_url && (
                      <a 
                        href={lead.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary"
                        title={lead.website_url}
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {lead.email && (
                      <a 
                        href={`mailto:${lead.email}`}
                        className="hover:text-primary"
                        title={lead.email}
                      >
                        <Mail className="h-4 w-4" />
                      </a>
                    )}
                    {lead.phone && (
                      <a 
                        href={`tel:${lead.phone}`}
                        className="hover:text-primary"
                        title={lead.phone}
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    )}
                  </div>

                  {/* Source & Date */}
                  <div className="md:col-span-1 text-sm text-muted-foreground">
                    <div className="line-clamp-1">{lead.source_query}</div>
                    <div className="text-xs mt-1">
                      {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="md:col-span-1 flex items-center justify-between gap-2">
                    <Badge className={statusColors[lead.status]}>
                      {lead.status}
                    </Badge>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreatePitch(lead)}
                        disabled={!lead.website_url || creatingPitchId === lead.id}
                      >
                        {creatingPitchId === lead.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Pitch
                          </>
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          {lead.website_url && (
                            <DropdownMenuItem asChild>
                              <a href={lead.website_url} target="_blank" rel="noopener noreferrer">
                                <Globe className="h-4 w-4 mr-2" />
                                Visit Website
                              </a>
                            </DropdownMenuItem>
                          )}
                          {lead.email && (
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${lead.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </a>
                            </DropdownMenuItem>
                          )}
                          {lead.email && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => setEmailDialogLead(lead)}>
                                <Send className="h-4 w-4 mr-2" />
                                Send Pitch Email
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteSingle(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Send Email Dialog */}
      {emailDialogLead && (
        <SendEmailDialog
          open={!!emailDialogLead}
          onOpenChange={(open) => !open && setEmailDialogLead(null)}
          recipientEmail={emailDialogLead.email || ''}
          recipientName={emailDialogLead.business_name}
          previewId={emailDialogLead.preview_id || '00000000-0000-0000-0000-000000000000'}
          previewUrl={emailDialogLead.preview_id ? `${window.location.origin}/preview/${emailDialogLead.preview_id}` : ''}
          leadId={emailDialogLead.id}
        />
      )}
    </div>
  );
}
