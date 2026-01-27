import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

type Step = 'url' | 'scraping' | 'processing' | 'template' | 'complete';

export default function NewPreview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [progress, setProgress] = useState(0);
  const [template, setTemplate] = useState('corporate-classic');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [processedSchema, setProcessedSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  };

  const handleScrape = async () => {
    if (!url || !clientName) {
      toast({
        title: 'Missing information',
        description: 'Please enter both client name and website URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStep('scraping');
    setProgress(10);

    try {
      // Step 1: Scrape the website
      setProgress(20);
      const scrapeResult = await firecrawlApi.scrape(url, {
        formats: ['markdown', 'html', 'links', 'branding'],
      });

      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error || 'Failed to scrape website');
      }

      const scraped = scrapeResult.data || scrapeResult;
      setScrapedData(scraped);
      setProgress(50);

      // Step 2: Process with AI
      setStep('processing');
      setProgress(60);

      const { data: processedResult, error: processError } = await supabase.functions.invoke(
        'process-content',
        {
          body: {
            scrapedContent: scraped,
            brandColors: scraped.branding,
          },
        }
      );

      if (processError || !processedResult?.success) {
        throw new Error(processError?.message || processedResult?.error || 'AI processing failed');
      }

      setProcessedSchema(processedResult.schema);
      setProgress(100);
      setStep('template');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      const stepHint = step === 'scraping' ? 'during website scraping' : 'during AI processing';
      toast({
        title: `Error ${stepHint}`,
        description: errorMessage.includes('Failed to fetch') 
          ? 'Network error - please check your connection and try again'
          : errorMessage,
        variant: 'destructive',
      });
      setStep('url');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);

    try {
      const slug = generateSlug(clientName);

      const { error } = await supabase.from('client_previews').insert({
        user_id: user.id,
        slug,
        client_name: clientName,
        original_url: url,
        template_id: template,
        scraped_content: scrapedData,
        processed_schema: processedSchema,
        brand_colors: scrapedData?.branding || null,
        status: 'draft',
      });

      if (error) throw error;

      setStep('complete');
      
      toast({
        title: 'Preview created!',
        description: 'Your client preview is ready to share.',
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error saving:', error);
      toast({
        title: 'Error saving preview',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Preview</h1>
          <p className="text-muted-foreground">
            Enter a website URL to generate a professional preview for your client
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className={`flex items-center gap-2 ${step === 'url' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Globe className="h-4 w-4" />
              <span className="text-sm">Enter URL</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'scraping' || step === 'processing' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Loader2 className={`h-4 w-4 ${(step === 'scraping' || step === 'processing') && isLoading ? 'animate-spin' : ''}`} />
              <span className="text-sm">Analyze</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'template' ? 'text-primary' : 'text-muted-foreground'}`}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Choose Template</span>
            </div>
            <div className={`flex items-center gap-2 ${step === 'complete' ? 'text-primary' : 'text-muted-foreground'}`}>
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Done</span>
            </div>
          </div>
          {(step === 'scraping' || step === 'processing') && (
            <Progress value={progress} className="h-2" />
          )}
        </div>

        {/* URL Input Step */}
        {step === 'url' && (
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Enter your client's current website to scrape their content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  placeholder="Acme Corporation"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <Button onClick={handleScrape} disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analyze Website
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Scraping/Processing Step */}
        {(step === 'scraping' || step === 'processing') && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-2">
                {step === 'scraping' ? 'Scraping Website...' : 'Processing Content with AI...'}
              </h3>
              <p className="text-muted-foreground">
                {step === 'scraping' 
                  ? 'Extracting logos, images, text, and brand colors'
                  : 'Organizing content into structured sections'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Template Selection Step */}
        {step === 'template' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                Select how you want your client's content to be displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={template} onValueChange={setTemplate}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Corporate Classic Template Preview */}
                  <label
                    htmlFor="corporate-classic"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'corporate-classic' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'corporate-classic' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {/* Mini Template Preview */}
                      <div className="aspect-[4/3] bg-gradient-to-b from-slate-900 to-slate-800 p-4 relative overflow-hidden">
                        {/* Mini Hero */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-3 mb-2">
                          <div className="w-8 h-2 bg-white/20 rounded mb-2" />
                          <div className="w-16 h-3 bg-white/40 rounded mb-1" />
                          <div className="w-12 h-2 bg-white/20 rounded" />
                        </div>
                        {/* Mini About Section */}
                        <div className="bg-white/5 rounded-lg p-2 mb-2">
                          <div className="w-10 h-2 bg-white/30 rounded mb-1" />
                          <div className="flex gap-1">
                            <div className="w-6 h-6 bg-white/10 rounded" />
                            <div className="w-6 h-6 bg-white/10 rounded" />
                            <div className="w-6 h-6 bg-white/10 rounded" />
                          </div>
                        </div>
                        {/* Mini Services Grid */}
                        <div className="grid grid-cols-3 gap-1">
                          <div className="aspect-square bg-white/10 rounded" />
                          <div className="aspect-square bg-white/10 rounded" />
                          <div className="aspect-square bg-white/10 rounded" />
                        </div>
                        {/* Decorative gradient */}
                        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      </div>
                      {/* Template Info */}
                      <div className="p-4 bg-background flex items-start gap-3">
                        <RadioGroupItem value="corporate-classic" id="corporate-classic" className="mt-1" />
                        <div>
                          <div className="font-semibold">Corporate Classic</div>
                          <div className="text-sm text-muted-foreground">
                            Clean, professional layout with subtle gradients
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Modern Professional Template Preview */}
                  <label
                    htmlFor="modern-professional"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'modern-professional' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'modern-professional' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {/* Mini Template Preview */}
                      <div className="aspect-[4/3] bg-black p-4 relative overflow-hidden">
                        {/* Animated shapes */}
                        <div className="absolute top-2 right-2 w-16 h-16 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-lg" />
                        <div className="absolute bottom-4 left-2 w-12 h-12 bg-gradient-to-br from-cyan-500/30 to-blue-500/30 rounded-full blur-lg" />
                        {/* Mini Hero with bold typography */}
                        <div className="relative z-10 mb-3">
                          <div className="w-6 h-6 bg-white/20 rounded-full mb-2" />
                          <div className="w-20 h-4 bg-white rounded mb-1" />
                          <div className="w-14 h-2 bg-white/40 rounded" />
                        </div>
                        {/* Horizontal scroll preview */}
                        <div className="flex gap-2 mb-2 overflow-hidden">
                          <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                          <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                          <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                          <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                        </div>
                        {/* Mini cards */}
                        <div className="flex gap-1">
                          <div className="flex-1 h-8 bg-white/10 rounded border border-white/20" />
                          <div className="flex-1 h-8 bg-white/10 rounded border border-white/20" />
                        </div>
                      </div>
                      {/* Template Info */}
                      <div className="p-4 bg-background flex items-start gap-3">
                        <RadioGroupItem value="modern-professional" id="modern-professional" className="mt-1" />
                        <div>
                          <div className="font-semibold">Modern Professional</div>
                          <div className="text-sm text-muted-foreground">
                            Bold design with animations & horizontal scrolls
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              <Button onClick={handleSave} disabled={isLoading} className="w-full" size="lg">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Preview
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-semibold mb-2">Preview Created!</h3>
              <p className="text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
