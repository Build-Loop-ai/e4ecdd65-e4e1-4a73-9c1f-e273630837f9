import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Globe, Loader2, CheckCircle2, Sparkles, Star } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ScanningProgress } from '@/components/preview/ScanningProgress';
import { INDUSTRY_DISPLAY_NAMES, type IndustryType } from '@/lib/templateStyles';
import { generatePitchSlug } from '@/lib/slugUtils';
import { detectImageGaps, needsImageGeneration, generateImages, mergeGeneratedImages } from '@/lib/imageGeneration';
import { collectImageUrls, auditImages } from '@/lib/imageQualityAudit';

type Step = 'url' | 'connecting' | 'extracting' | 'processing' | 'auditing' | 'generating' | 'template' | 'complete';

// Helper to truncate text
const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export default function NewPreview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get lead context from navigation state (when creating pitch from a lead)
  const navState = location.state as { prefilledUrl?: string; leadId?: string; clientName?: string } | null;
  
  const [step, setStep] = useState<Step>('url');
  const [url, setUrl] = useState(navState?.prefilledUrl || '');
  const [clientName, setClientName] = useState(navState?.clientName || '');
  const [leadId] = useState<string | undefined>(navState?.leadId);
  const [progress, setProgress] = useState(0);
  const [template, setTemplate] = useState('corporate-classic');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [processedSchema, setProcessedSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name: string | null } | null>(null);

  // Fetch user profile for slug generation
  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => setUserProfile(data));
    }
  }, [user]);

  // Auto-select recommended template when processing completes
  useEffect(() => {
    if (processedSchema?.businessIntelligence?.recommendedTemplate) {
      setTemplate(processedSchema.businessIntelligence.recommendedTemplate);
    }
  }, [processedSchema]);

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
      setProgress(40);

      // Step 2: Process with AI
      setStep('processing');
      setProgress(50);

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

      let schema = processedResult.schema;
      setProcessedSchema(schema);
      setProgress(65);

      // Step 3: Audit existing image quality
      const existingImages = collectImageUrls(schema);
      const existingUrls = existingImages.map(i => i.url);
      
      if (existingUrls.length > 0) {
        setStep('auditing');
        setProgress(70);
        console.log('Auditing', existingUrls.length, 'images for quality...');
        
        const businessTypeForAudit = schema?.businessIntelligence?.businessType || 'business';
        const auditReport = await auditImages(existingUrls, businessTypeForAudit);
        console.log('Audit results:', auditReport.passCount, 'pass,', auditReport.failCount, 'fail');

        // Remove failed/unreachable images from schema so they get regenerated
        if (auditReport.failCount > 0) {
          const failedUrls = new Set(
            auditReport.results.filter(r => r.status !== 'pass').map(r => r.url)
          );
          
          // Remove failed hero images
          if (schema.hero?.backgroundImages) {
            schema.hero.backgroundImages = schema.hero.backgroundImages.filter(
              (url: string) => !failedUrls.has(url)
            );
          }
          // Remove failed heroImages (classification array)
          if (schema.heroImages) {
            schema.heroImages = schema.heroImages.filter(
              (img: any) => !failedUrls.has(img.url || img)
            );
          }
          // Remove failed gallery images
          if (schema.gallery?.images) {
            schema.gallery.images = schema.gallery.images.filter((img: any) => {
              const url = typeof img === 'string' ? img : img?.url;
              return !failedUrls.has(url);
            });
          }
          if (schema.galleryImages) {
            schema.galleryImages = schema.galleryImages.filter(
              (img: any) => !failedUrls.has(img.url || img)
            );
          }
          // Clear failed service images
          if (schema.services) {
            schema.services = schema.services.map((svc: any) => {
              if (svc.image && failedUrls.has(svc.image)) {
                return { ...svc, image: undefined };
              }
              return svc;
            });
          }
          setProcessedSchema({ ...schema });
        }
      }

      setProgress(75);

      // Step 4: Generate missing images (includes ones removed by audit)
      const imageGaps = detectImageGaps(schema);
      
      if (needsImageGeneration(imageGaps)) {
        setStep('generating');
        setProgress(80);
        
        console.log('Generating images for gaps:', imageGaps);
        
        const primaryColor = scraped?.branding?.colors?.primary || '#4F46E5';
        const businessType = schema?.businessIntelligence?.businessType || 'default';
        const industry = schema?.businessIntelligence?.industry || 'general';
        
        const imageResult = await generateImages({
          businessType,
          industry,
          companyName: clientName,
          primaryColor,
          missingImages: imageGaps
        });

        if (imageResult.success && imageResult.generatedImages) {
          schema = mergeGeneratedImages(schema, imageResult.generatedImages);
          setProcessedSchema(schema);
          console.log('Images generated and merged:', imageResult.generatedImages);
        } else {
          console.warn('Image generation failed, continuing without:', imageResult.error);
        }
      }

      setProgress(100);
      setStep('template');
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      const stepHint = step === 'extracting' 
        ? 'during website scraping' 
        : step === 'generating' 
          ? 'during image generation'
          : 'during AI processing';
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
      // Generate slug with user prefix and client name
      const slug = generatePitchSlug(clientName, userProfile?.full_name, user.email);

      const { data: savedPitch, error } = await supabase.from('client_previews').insert({
        user_id: user.id,
        slug,
        client_name: clientName,
        original_url: url,
        template_id: template,
        scraped_content: scrapedData,
        processed_schema: processedSchema,
        brand_colors: scrapedData?.branding || null,
        status: 'draft',
      }).select('id').single();

      if (error) throw error;

      // Backfill lead email from scraped content if we came from a lead
      if (leadId && processedSchema?.contact?.email) {
        const extractedEmail = processedSchema.contact.email;
        // Only update if lead currently has no email
        const { data: lead } = await supabase
          .from('leads')
          .select('email')
          .eq('id', leadId)
          .maybeSingle();
        
        if (lead && !lead.email) {
          await supabase
            .from('leads')
            .update({ email: extractedEmail })
            .eq('id', leadId);
          console.log(`Backfilled email "${extractedEmail}" to lead ${leadId}`);
        }

        // Also link pitch to lead
        if (savedPitch?.id) {
          await supabase
            .from('leads')
            .update({ preview_id: savedPitch.id })
            .eq('id', leadId);
        }
      }

      setStep('complete');
      
      toast({
        title: 'Ready to send!',
        description: 'Your pitch is ready to share with the prospect.',
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

  // Business intelligence data
  const businessIntelligence = processedSchema?.businessIntelligence;
  const recommendedTemplate = businessIntelligence?.recommendedTemplate;
  const industry = businessIntelligence?.industry as IndustryType | undefined;
  const businessType = businessIntelligence?.businessType;
  const industryDisplayName = industry ? INDUSTRY_DISPLAY_NAMES[industry] || industry : null;

  const isScanning = step === 'connecting' || step === 'extracting' || step === 'processing' || step === 'auditing' || step === 'generating';

  // Helper to check if template is recommended
  const isRecommended = (templateId: string) => templateId === recommendedTemplate;

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
          <h1 className="text-3xl font-bold mb-2">New Pitch</h1>
          <p className="text-muted-foreground">
            Enter a prospect's website URL to generate a stunning preview
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
              <CardTitle>Prospect Information</CardTitle>
              <CardDescription>
                Enter your prospect's current website to analyze their content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Company Name</Label>
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
            phase={step as 'connecting' | 'extracting' | 'processing' | 'auditing' | 'generating'}
            url={url}
            scrapedData={scrapedData}
            processedSchema={processedSchema}
          />
        )}

        {/* Template Selection Step with Live Content */}
        {step === 'template' && (
          <Card className="max-w-5xl mx-auto">
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription className="flex flex-col gap-2">
                <span>See how {companyName}'s content looks in each template</span>
                {industryDisplayName && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Detected: {industryDisplayName}
                    </Badge>
                    {businessType && (
                      <Badge variant="outline" className="text-xs">
                        {businessType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup value={template} onValueChange={setTemplate}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Corporate Classic */}
                  <label
                    htmlFor="corporate-classic"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'corporate-classic' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'corporate-classic' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {isRecommended('corporate-classic') && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3" /> AI Pick
                          </Badge>
                        </div>
                      )}
                      <div 
                        className="aspect-[4/3] p-3 relative overflow-hidden"
                        style={{ 
                          background: heroImage 
                            ? `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${heroImage}) center/cover`
                            : `linear-gradient(135deg, ${secondaryColor} 0%, ${primaryColor}33 100%)`
                        }}
                      >
                        {logo && (
                          <div className="bg-white/10 backdrop-blur-sm rounded p-1 inline-block mb-2">
                            <img src={logo} alt="Logo" className="h-4 object-contain max-w-[60px]" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                        )}
                        <div className="text-white text-xs font-bold leading-tight mb-1">{truncate(headline, 30)}</div>
                        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="p-3 bg-background flex items-start gap-2">
                        <RadioGroupItem value="corporate-classic" id="corporate-classic" className="mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Corporate Classic</div>
                          <div className="text-xs text-muted-foreground">Law, consulting, B2B</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Modern Professional */}
                  <label
                    htmlFor="modern-professional"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'modern-professional' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'modern-professional' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {isRecommended('modern-professional') && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3" /> AI Pick
                          </Badge>
                        </div>
                      )}
                      <div className="aspect-[4/3] bg-black p-3 relative overflow-hidden">
                        <div className="absolute top-2 right-2 w-12 h-12 rounded-full blur-xl opacity-40" style={{ backgroundColor: primaryColor }} />
                        {logo && (
                          <div className="bg-white/10 backdrop-blur-sm rounded p-1 inline-block mb-2">
                            <img src={logo} alt="Logo" className="h-4 object-contain max-w-[60px]" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                        )}
                        <div className="text-white text-xs font-bold leading-tight">{truncate(headline, 25)}</div>
                      </div>
                      <div className="p-3 bg-background flex items-start gap-2">
                        <RadioGroupItem value="modern-professional" id="modern-professional" className="mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Modern Professional</div>
                          <div className="text-xs text-muted-foreground">Tech, SaaS, startups</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Bold Starter */}
                  <label
                    htmlFor="bold-starter"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'bold-starter' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'bold-starter' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {isRecommended('bold-starter') && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3" /> AI Pick
                          </Badge>
                        </div>
                      )}
                      <div className="aspect-[4/3] bg-black p-3 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${primaryColor}50 0%, purple 100%)` }} />
                        <div className="absolute top-2 left-2 w-6 h-6 bg-white/10 rounded-lg backdrop-blur" />
                        <div className="relative z-10 mt-4">
                          <div 
                            className="text-xs font-black leading-tight"
                            style={{
                              background: `linear-gradient(135deg, white 0%, ${primaryColor} 100%)`,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                            }}
                          >
                            {truncate(headline, 25)}
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-background flex items-start gap-2">
                        <RadioGroupItem value="bold-starter" id="bold-starter" className="mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Bold Starter</div>
                          <div className="text-xs text-muted-foreground">Creative, agencies, design</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Elegant Minimal */}
                  <label
                    htmlFor="elegant-minimal"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'elegant-minimal' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'elegant-minimal' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {isRecommended('elegant-minimal') && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3" /> AI Pick
                          </Badge>
                        </div>
                      )}
                      <div className="aspect-[4/3] bg-stone-50 p-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <div className="text-xs font-light text-stone-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
                          {truncate(headline, 30)}
                        </div>
                        <div className="w-8 h-px mt-2" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="p-3 bg-background flex items-start gap-2">
                        <RadioGroupItem value="elegant-minimal" id="elegant-minimal" className="mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Elegant Minimal</div>
                          <div className="text-xs text-muted-foreground">Luxury, fashion, architecture</div>
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Warm Friendly */}
                  <label
                    htmlFor="warm-friendly"
                    className={`group cursor-pointer transition-all duration-300 ${
                      template === 'warm-friendly' ? 'scale-[1.02]' : 'hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`relative rounded-xl overflow-hidden border-2 transition-colors ${
                      template === 'warm-friendly' ? 'border-primary shadow-lg shadow-primary/20' : 'border-border hover:border-primary/50'
                    }`}>
                      {isRecommended('warm-friendly') && (
                        <div className="absolute top-2 right-2 z-10">
                          <Badge className="bg-green-500 hover:bg-green-600 text-white text-[10px] px-2 py-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3" /> AI Pick
                          </Badge>
                        </div>
                      )}
                      <div className="aspect-[4/3] p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)' }}>
                        {logo && (
                          <div className="bg-white/80 rounded-xl p-1.5 inline-block mb-2 shadow-sm">
                            <img src={logo} alt="Logo" className="h-5 object-contain max-w-[70px]" onError={(e) => e.currentTarget.style.display = 'none'} />
                          </div>
                        )}
                        <div className="text-stone-800 text-xs font-bold leading-tight">{truncate(headline, 30)}</div>
                        <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: primaryColor }} />
                      </div>
                      <div className="p-3 bg-background flex items-start gap-2">
                        <RadioGroupItem value="warm-friendly" id="warm-friendly" className="mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">Warm Friendly</div>
                          <div className="text-xs text-muted-foreground">Cafes, salons, local shops</div>
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
