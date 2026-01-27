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
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                Select how you want your client's content to be displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={template} onValueChange={setTemplate}>
                <div className="grid gap-4">
                  <label
                    htmlFor="corporate-classic"
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      template === 'corporate-classic' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value="corporate-classic" id="corporate-classic" />
                    <div>
                      <div className="font-semibold">Corporate Classic</div>
                      <div className="text-sm text-muted-foreground">
                        Clean, professional layout perfect for business services and consultants
                      </div>
                    </div>
                  </label>
                  <label
                    htmlFor="modern-professional"
                    className={`flex items-start gap-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                      template === 'modern-professional' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <RadioGroupItem value="modern-professional" id="modern-professional" />
                    <div>
                      <div className="font-semibold">Modern Professional</div>
                      <div className="text-sm text-muted-foreground">
                        Bold typography and modern design for agencies and creative professionals
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>

              <Button onClick={handleSave} disabled={isLoading} className="w-full">
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
