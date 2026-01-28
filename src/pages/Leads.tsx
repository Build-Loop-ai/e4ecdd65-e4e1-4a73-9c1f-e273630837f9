import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { searchLeads, type ApifyLead } from '@/lib/api/apify';
import { 
  Search, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Plus,
  ExternalLink,
  Loader2,
  Building2
} from 'lucide-react';

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ApifyLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [savingLeadIndex, setSavingLeadIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({ title: 'Please enter a search query', variant: 'destructive' });
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await searchLeads(searchQuery.trim());
      
      if (response.success && response.data) {
        setResults(response.data);
        if (response.data.length === 0) {
          toast({ title: 'No results found', description: 'Try a different search query' });
        }
      } else {
        toast({ 
          title: 'Search failed', 
          description: response.error || 'Could not search for leads',
          variant: 'destructive' 
        });
      }
    } catch (error) {
      toast({ 
        title: 'Search error', 
        description: 'An unexpected error occurred',
        variant: 'destructive' 
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreatePitch = async (lead: ApifyLead, index: number) => {
    if (!lead.website_url) {
      toast({ 
        title: 'No website available', 
        description: 'This business does not have a website to create a pitch from',
        variant: 'destructive' 
      });
      return;
    }

    setSavingLeadIndex(index);

    try {
      // First save the lead to the database
      const { data: savedLead, error: saveError } = await supabase
        .from('leads')
        .insert({
          user_id: user!.id,
          business_name: lead.business_name,
          website_url: lead.website_url,
          email: lead.email,
          phone: lead.phone,
          address: lead.address,
          city: lead.city,
          category: lead.category,
          rating: lead.rating,
          source_query: searchQuery,
          status: 'new',
        })
        .select()
        .single();

      if (saveError) {
        console.error('Error saving lead:', saveError);
        toast({ 
          title: 'Failed to save lead', 
          description: saveError.message,
          variant: 'destructive' 
        });
        return;
      }

      // Navigate to new pitch page with pre-filled URL and lead ID
      navigate('/dashboard/new', { 
        state: { 
          prefilledUrl: lead.website_url,
          leadId: savedLead.id,
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
      setSavingLeadIndex(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Find Leads</h1>
          <p className="text-muted-foreground mt-1">
            Search for local businesses and create pitches for them
          </p>
        </div>

        {/* Search Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Businesses
            </CardTitle>
            <CardDescription>
              Enter a search like "barbers in zaandam" or "restaurants in amsterdam"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="e.g., barbers in zaandam"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
                disabled={isSearching}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {isSearching && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isSearching && hasSearched && results.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No businesses found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or location
              </p>
            </CardContent>
          </Card>
        )}

        {!isSearching && results.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found {results.length} businesses
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((lead, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Business Name & Category */}
                      <div>
                        <h3 className="font-medium text-foreground line-clamp-1">
                          {lead.business_name}
                        </h3>
                        {lead.category && (
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {lead.category}
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {lead.website_url && (
                          <div className="flex items-center gap-2">
                            <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                            <a 
                              href={lead.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="truncate hover:text-primary"
                            >
                              {lead.website_url.replace(/^https?:\/\//, '').split('/')[0]}
                            </a>
                          </div>
                        )}
                        {lead.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {(lead.address || lead.city) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {lead.city || lead.address}
                            </span>
                          </div>
                        )}
                        {lead.rating && (
                          <div className="flex items-center gap-2">
                            <Star className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
                            <span>{lead.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleCreatePitch(lead, index)}
                          disabled={!lead.website_url || savingLeadIndex === index}
                        >
                          {savingLeadIndex === index ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-1" />
                          )}
                          Create Pitch
                        </Button>
                        {lead.google_maps_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            asChild
                          >
                            <a 
                              href={lead.google_maps_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Empty state before search */}
        {!hasSearched && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Start searching for leads</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a search query above to find local businesses. 
                You can search by business type and location, like "dentists in rotterdam".
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
