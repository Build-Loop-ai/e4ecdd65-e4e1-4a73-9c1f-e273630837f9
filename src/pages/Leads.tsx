import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { searchLeads, type ApifyLead } from '@/lib/api/apify';
import { useLeads } from '@/hooks/useLeads';
import { LeadCard } from '@/components/leads/LeadCard';
import { SavedLeadsList } from '@/components/leads/SavedLeadsList';
import { 
  Search, 
  Loader2,
  Building2,
  Users
} from 'lucide-react';
import { GlowIcon } from '@/components/ui/GlowIcon';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
    },
  },
};

const skeletonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
    },
  }),
};

export default function Leads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ApifyLead[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [creatingPitchIndex, setCreatingPitchIndex] = useState<number | null>(null);
  const [savedUrls, setSavedUrls] = useState<Set<string>>(new Set());
  
  const { 
    savedLeads,
    checkExistingLeads, 
    saveAllLeads,
  } = useLeads();


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
        } else {
          // Auto-save all discovered leads to My Leads
          const urls = response.data.map(r => r.website_url).filter(Boolean) as string[];
          const existing = await checkExistingLeads(urls);
          setSavedUrls(existing);

          const hasUnsaved = response.data.some(
            r => r.website_url && !existing.has(r.website_url)
          );
          if (hasUnsaved) {
            try {
              const result = await saveAllLeads({
                leads: response.data,
                sourceQuery: searchQuery.trim(),
                existingUrls: existing,
              });
              if (result.data) {
                setSavedUrls(prev => new Set([
                  ...prev,
                  ...result.data!.map(d => d.website_url).filter(Boolean) as string[],
                ]));
              }
            } catch {
              // Non-blocking — leads still shown even if auto-save fails
            }
          }
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

    setCreatingPitchIndex(index);

    try {
      // Lead is already saved from auto-save — just find its ID and update status
      const { data: existingLead } = await supabase
        .from('leads')
        .select('id')
        .eq('user_id', user!.id)
        .eq('website_url', lead.website_url)
        .maybeSingle();
      
      let leadId = existingLead?.id;

      if (leadId) {
        await supabase
          .from('leads')
          .update({ status: 'pitched' })
          .eq('id', leadId);
      }

      navigate('/dashboard/new', { 
        state: { 
          prefilledUrl: lead.website_url,
          leadId,
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
      setCreatingPitchIndex(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Find Leads</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Search for local businesses and create pitches for them.
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="search" className="space-y-8">
          <TabsList>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              My Leads
              {savedLeads.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary">
                  {savedLeads.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-8">
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

            {/* Loading State */}
            <AnimatePresence mode="wait">
              {isSearching && (
                <motion.div 
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0 }}
                >
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      custom={i}
                      variants={skeletonVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-9 w-full" />
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* No Results */}
            {!isSearching && hasSearched && results.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 w-fit"><GlowIcon icon={Building2} size="lg" /></div>
                  <h3 className="text-lg font-medium mb-2">No businesses found</h3>
                  <p className="text-muted-foreground">
                    Try searching with different keywords or location
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Results */}
            <AnimatePresence mode="wait">
              {!isSearching && results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <motion.div 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-sm text-muted-foreground">
                      Found <span className="font-medium text-foreground">{results.length}</span> businesses — auto-saved to My Leads
                    </p>
                  </motion.div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((lead, index) => (
                      <LeadCard
                        key={`${lead.business_name}-${index}`}
                        lead={lead}
                        index={index}
                        isSaved={lead.website_url ? savedUrls.has(lead.website_url) : false}
                        onCreatePitch={() => handleCreatePitch(lead, index)}
                        isCreatingPitch={creatingPitchIndex === index}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty state before search */}
            {!hasSearched && (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto mb-4 w-fit"><GlowIcon icon={Search} size="lg" /></div>
                  <h3 className="text-lg font-medium mb-2">Start searching for leads</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Enter a search query above to find local businesses. 
                    You can search by business type and location, like "dentists in rotterdam".
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Saved Leads Tab */}
          <TabsContent value="saved">
            <SavedLeadsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
