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
import { ScanningProgress } from '@/components/preview/ScanningProgress';

type Step = 'url' | 'connecting' | 'extracting' | 'processing' | 'template' | 'complete';

// Helper to truncate text
const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

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
    setStep('connecting');
    setProgress(10);

    try {
      // Simulate connection delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 1: Scrape the website
      setStep('extracting');
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
      const stepHint = step === 'extracting' ? 'during website scraping' : 'during AI processing';
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

  // Extract data for template previews
  const primaryColor = scrapedData?.branding?.colors?.primary || '#3b82f6';
  const secondaryColor = scrapedData?.branding?.colors?.secondary || '#1e293b';
  const logo = scrapedData?.branding?.logo || scrapedData?.branding?.images?.logo;
  const headline = processedSchema?.hero?.headline || 'Your Headline Here';
  const heroImage = processedSchema?.hero?.backgroundImages?.[0];
  const galleryImages = processedSchema?.gallery?.images?.slice(0, 4) || [];
  const serviceCount = processedSchema?.services?.length || 0;
  const companyName = processedSchema?.companyName || clientName;

  const isScanning = step === 'connecting' || step === 'extracting' || step === 'processing';

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

      <main className="container mx-auto px-4 py-8 max-w-3xl">
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
            <div className={`flex items-center gap-2 ${isScanning ? 'text-primary' : 'text-muted-foreground'}`}>
              <Loader2 className={`h-4 w-4 ${isScanning && isLoading ? 'animate-spin' : ''}`} />
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
          {isScanning && (
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

        {/* Immersive Scanning Step */}
        {isScanning && (
          <ScanningProgress
            phase={step as 'connecting' | 'extracting' | 'processing'}
            url={url}
            scrapedData={scrapedData}
            processedSchema={processedSchema}
          />
        )}

        {/* Template Selection Step with Live Content */}
        {step === 'template' && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                See how {companyName}'s content looks in each template
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={template} onValueChange={setTemplate}>
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Corporate Classic Template Preview with REAL content */}
                  <label
                    htmlFor="corporate-classic"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'corporate-classic' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'corporate-classic' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {/* Mini Template Preview with ACTUAL scraped content */}
                      <div 
                        className="aspect-[4/3] p-4 relative overflow-hidden"
                        style={{ 
                          background: heroImage 
                            ? `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${heroImage}) center/cover`
                            : `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor}33 100%)`
                        }}
                      >
                        {/* Logo */}
                        <div className="mb-3">
                          {logo ? (
                            <div className="bg-white/10 backdrop-blur-sm rounded p-1.5 inline-block">
                              <img 
                                src={logo} 
                                alt="Logo" 
                                className="h-6 object-contain max-w-[80px]"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-4 bg-white/30 rounded" />
                          )}
                        </div>
                        
                        {/* Actual headline */}
                        <div className="text-white mb-2">
                          <div className="text-sm font-bold leading-tight">
                            {truncate(headline, 40)}
                          </div>
                        </div>

                        {/* Service count indicator */}
                        {serviceCount > 0 && (
                          <div className="flex gap-1 mb-2">
                            {Array.from({ length: Math.min(serviceCount, 3) }).map((_, i) => (
                              <div 
                                key={i}
                                className="w-8 h-8 rounded"
                                style={{ backgroundColor: `${primaryColor}44` }}
                              />
                            ))}
                            {serviceCount > 3 && (
                              <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center text-white text-xs">
                                +{serviceCount - 3}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Color accent bar */}
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-1"
                          style={{ backgroundColor: primaryColor }}
                        />
                      </div>

                      {/* Template Info */}
                      <div className="p-4 bg-background flex items-start gap-3">
                        <RadioGroupItem value="corporate-classic" id="corporate-classic" className="mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold">Corporate Classic</div>
                          <div className="text-sm text-muted-foreground">
                            Clean, professional layout
                          </div>
                          {/* Brand colors preview */}
                          <div className="flex gap-1.5 mt-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: primaryColor }}
                              title="Primary color"
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: secondaryColor }}
                              title="Secondary color"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Modern Professional Template Preview with REAL content */}
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
                        {/* Animated gradient orbs using brand colors */}
                        <div 
                          className="absolute top-2 right-2 w-16 h-16 rounded-full blur-xl opacity-40"
                          style={{ backgroundColor: primaryColor }}
                        />
                        <div 
                          className="absolute bottom-4 left-2 w-12 h-12 rounded-full blur-xl opacity-30"
                          style={{ backgroundColor: secondaryColor }}
                        />

                        {/* Logo */}
                        <div className="relative z-10 mb-2">
                          {logo ? (
                            <div className="bg-white/10 backdrop-blur-sm rounded p-1 inline-block">
                              <img 
                                src={logo} 
                                alt="Logo" 
                                className="h-5 object-contain max-w-[60px]"
                                onError={(e) => e.currentTarget.style.display = 'none'}
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 bg-white/20 rounded-full" />
                          )}
                        </div>

                        {/* Bold headline */}
                        <div className="relative z-10 mb-3">
                          <div className="text-white text-base font-bold leading-tight">
                            {truncate(headline, 30)}
                          </div>
                        </div>

                        {/* Horizontal scroll preview with ACTUAL gallery images */}
                        <div className="flex gap-2 mb-2 overflow-hidden relative z-10">
                          {galleryImages.length > 0 ? (
                            galleryImages.map((img: any, i: number) => (
                              <div 
                                key={i}
                                className="w-10 h-14 bg-white/10 rounded flex-shrink-0 overflow-hidden"
                              >
                                <img 
                                  src={img.url || img} 
                                  alt="" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => e.currentTarget.style.display = 'none'}
                                />
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                              <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                              <div className="w-10 h-14 bg-gradient-to-br from-white/20 to-white/5 rounded flex-shrink-0" />
                            </>
                          )}
                        </div>

                        {/* CTA with brand color */}
                        <div 
                          className="relative z-10 h-6 w-20 rounded text-white text-xs flex items-center justify-center"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Contact
                        </div>
                      </div>

                      {/* Template Info */}
                      <div className="p-4 bg-background flex items-start gap-3">
                        <RadioGroupItem value="modern-professional" id="modern-professional" className="mt-1" />
                        <div className="flex-1">
                          <div className="font-semibold">Modern Professional</div>
                          <div className="text-sm text-muted-foreground">
                            Bold design with animations
                          </div>
                          {/* Brand colors preview */}
                          <div className="flex gap-1.5 mt-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: primaryColor }}
                              title="Primary color"
                            />
                            <div 
                              className="w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: secondaryColor }}
                              title="Secondary color"
                            />
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
