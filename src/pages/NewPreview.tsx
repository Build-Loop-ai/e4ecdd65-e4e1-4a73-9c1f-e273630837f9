import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Globe, Loader2, CheckCircle2, Sparkles, Star,
  Palette, Image, FileText, Zap, ArrowRight
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { ScanningProgress } from '@/components/preview/ScanningProgress';
import { INDUSTRY_DISPLAY_NAMES, type IndustryType } from '@/lib/templateStyles';
import { generatePitchSlug } from '@/lib/slugUtils';
import { detectImageGaps, needsImageGeneration, generateImages, mergeGeneratedImages } from '@/lib/imageGeneration';
import { collectImageUrls, auditImages } from '@/lib/imageQualityAudit';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type Step = 'url' | 'connecting' | 'extracting' | 'processing' | 'auditing' | 'generating' | 'template' | 'complete';

const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

const STEPS_META = [
  { key: 'url', label: 'Details', icon: Globe },
  { key: 'scan', label: 'Analyze', icon: Sparkles },
  { key: 'template', label: 'Template', icon: Palette },
  { key: 'complete', label: 'Done', icon: CheckCircle2 },
];

export default function NewPreview() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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

      setStep('processing');
      setProgress(50);

      const { data: processedResult, error: processError } = await supabase.functions.invoke(
        'process-content',
        { body: { scrapedContent: scraped, brandColors: scraped.branding } }
      );

      if (processError || !processedResult?.success) {
        throw new Error(processError?.message || processedResult?.error || 'AI processing failed');
      }

      let schema = processedResult.schema;
      setProcessedSchema(schema);
      setProgress(65);

      const existingImages = collectImageUrls(schema);
      const existingUrls = existingImages.map(i => i.url);
      
      if (existingUrls.length > 0) {
        setStep('auditing');
        setProgress(70);
        
        const businessTypeForAudit = schema?.businessIntelligence?.businessType || 'business';
        const auditReport = await auditImages(existingUrls, businessTypeForAudit);

        if (auditReport.failCount > 0) {
          const failedUrls = new Set(
            auditReport.results.filter(r => r.status !== 'pass').map(r => r.url)
          );
          
          if (schema.hero?.backgroundImages) {
            schema.hero.backgroundImages = schema.hero.backgroundImages.filter(
              (url: string) => !failedUrls.has(url)
            );
          }
          if (schema.heroImages) {
            schema.heroImages = schema.heroImages.filter(
              (img: any) => !failedUrls.has(img.url || img)
            );
          }
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

      const imageGaps = detectImageGaps(schema);
      
      if (needsImageGeneration(imageGaps)) {
        setStep('generating');
        setProgress(80);
        
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

      if (leadId && processedSchema?.contact?.email) {
        const extractedEmail = processedSchema.contact.email;
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
        }

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

  // Derived data
  const primaryColor = scrapedData?.branding?.colors?.primary || '#4F46E5';
  const logo = scrapedData?.branding?.logo || scrapedData?.branding?.images?.logo;
  const headline = processedSchema?.hero?.headline || 'Your Headline Here';
  const heroImage = processedSchema?.hero?.backgroundImages?.[0];
  const companyName = processedSchema?.companyName || clientName;
  const businessIntelligence = processedSchema?.businessIntelligence;
  const recommendedTemplate = businessIntelligence?.recommendedTemplate;
  const industry = businessIntelligence?.industry as IndustryType | undefined;
  const businessType = businessIntelligence?.businessType;
  const industryDisplayName = industry ? INDUSTRY_DISPLAY_NAMES[industry] || industry : null;
  const isScanning = step === 'connecting' || step === 'extracting' || step === 'processing' || step === 'auditing' || step === 'generating';
  const isRecommended = (templateId: string) => templateId === recommendedTemplate;

  const getStepIndex = () => {
    if (step === 'url') return 0;
    if (isScanning) return 1;
    if (step === 'template') return 2;
    return 3;
  };

  const templates = [
    { 
      id: 'corporate-classic', name: 'Corporate Classic', desc: 'Law, consulting, B2B',
      renderPreview: () => (
        <div 
          className="aspect-[4/3] p-4 relative overflow-hidden"
          style={{ 
            background: heroImage 
              ? `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.8)), url(${heroImage}) center/cover`
              : `linear-gradient(135deg, hsl(var(--foreground)) 0%, ${primaryColor}33 100%)`
          }}
        >
          {logo && (
            <div className="bg-white/10 backdrop-blur-sm rounded p-1 inline-block mb-2">
              <img src={logo} alt="" className="h-4 object-contain max-w-[60px]" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
          <div className="text-white text-xs font-bold leading-tight mb-1">{truncate(headline, 30)}</div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: primaryColor }} />
        </div>
      )
    },
    { 
      id: 'modern-professional', name: 'Modern Professional', desc: 'Tech, SaaS, startups',
      renderPreview: () => (
        <div className="aspect-[4/3] bg-foreground p-4 relative overflow-hidden">
          <div className="absolute top-2 right-2 w-12 h-12 rounded-full blur-xl opacity-40" style={{ backgroundColor: primaryColor }} />
          {logo && (
            <div className="bg-white/10 backdrop-blur-sm rounded p-1 inline-block mb-2">
              <img src={logo} alt="" className="h-4 object-contain max-w-[60px]" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
          <div className="text-white text-xs font-bold leading-tight">{truncate(headline, 25)}</div>
        </div>
      )
    },
    { 
      id: 'bold-starter', name: 'Bold Starter', desc: 'Agencies, creatives, design',
      renderPreview: () => (
        <div className="aspect-[4/3] bg-foreground p-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ background: `linear-gradient(135deg, ${primaryColor}50 0%, purple 100%)` }} />
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
      )
    },
    { 
      id: 'elegant-minimal', name: 'Elegant Minimal', desc: 'Luxury, fashion, architecture',
      renderPreview: () => (
        <div className="aspect-[4/3] bg-stone-50 p-4 relative overflow-hidden flex flex-col items-center justify-center text-center">
          <div className="text-xs font-light text-stone-800 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            {truncate(headline, 30)}
          </div>
          <div className="w-8 h-px mt-2" style={{ backgroundColor: primaryColor }} />
        </div>
      )
    },
    { 
      id: 'warm-friendly', name: 'Warm Friendly', desc: 'Cafes, salons, local shops',
      renderPreview: () => (
        <div className="aspect-[4/3] p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fff7ed 0%, #fce7f3 100%)' }}>
          {logo && (
            <div className="bg-white/80 rounded-xl p-1.5 inline-block mb-2 shadow-sm">
              <img src={logo} alt="" className="h-5 object-contain max-w-[70px]" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
          )}
          <div className="text-stone-800 text-xs font-bold leading-tight">{truncate(headline, 30)}</div>
          <div className="absolute bottom-3 left-3 w-6 h-6 rounded-full shadow-md" style={{ backgroundColor: primaryColor }} />
        </div>
      )
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-4xl">
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Dashboard
            </Link>
          </Button>
          
          {/* Step indicators */}
          <div className="flex items-center gap-1">
            {STEPS_META.map((s, i) => {
              const currentIdx = getStepIndex();
              const isActive = i === currentIdx;
              const isDone = i < currentIdx;
              return (
                <div key={s.key} className="flex items-center">
                  {i > 0 && (
                    <div className={cn(
                      "w-6 h-px mx-1 transition-colors",
                      isDone ? "bg-primary" : "bg-border"
                    )} />
                  )}
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all",
                    isActive && "bg-primary/10 text-primary",
                    isDone && "text-primary",
                    !isActive && !isDone && "text-muted-foreground"
                  )}>
                    {isDone ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <s.icon className={cn("h-3.5 w-3.5", isActive && isScanning && "animate-spin")} />
                    )}
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-2xl">
        <AnimatePresence mode="wait">
          {/* ========== URL INPUT STEP ========== */}
          {step === 'url' && (
            <motion.div
              key="url"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-16"
            >
              {/* Hero section */}
              <div className="text-center mb-12">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                >
                  <Sparkles className="h-4 w-4" />
                  AI-Powered Pitch Generator
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-3">
                  Create a new pitch
                </h1>
                <p className="text-lg text-muted-foreground max-w-md mx-auto">
                  Enter a website and we'll build a stunning, personalized preview in seconds.
                </p>
              </div>

              {/* Input card */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border border-border shadow-sm p-8 space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientName" className="text-sm font-medium">Company Name</Label>
                    <Input
                      id="clientName"
                      placeholder="Acme Corporation"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-12 text-base"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="url" className="text-sm font-medium">Website URL</Label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 pl-11 text-base"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleScrape} 
                  disabled={isLoading || !url || !clientName} 
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Website
                    </>
                  )}
                </Button>
              </motion.div>

              {/* What we extract */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3"
              >
                {[
                  { icon: Palette, label: 'Brand colors', desc: 'Auto-detected' },
                  { icon: Image, label: 'Images & logo', desc: 'Extracted' },
                  { icon: FileText, label: 'Content & copy', desc: 'AI-enhanced' },
                  { icon: Zap, label: 'Business type', desc: 'Classified' },
                ].map((item, i) => (
                  <motion.div 
                    key={item.label}
                    initial={{ y: 15, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card border border-border text-center"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <item.icon className="h-4.5 w-4.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {/* ========== SCANNING STEP ========== */}
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-16"
            >
              <ScanningProgress
                phase={step as 'connecting' | 'extracting' | 'processing' | 'auditing' | 'generating'}
                url={url}
                scrapedData={scrapedData}
                processedSchema={processedSchema}
              />
            </motion.div>
          )}

          {/* ========== TEMPLATE SELECTION ========== */}
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-12"
            >
              {/* Header with extracted info */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">Choose a template</h2>
                <p className="text-muted-foreground mb-4">
                  See how {companyName}'s content looks in each layout
                </p>
                {(industryDisplayName || businessType) && (
                  <div className="flex items-center justify-center gap-2">
                    {industryDisplayName && (
                      <Badge variant="secondary" className="text-xs">
                        {industryDisplayName}
                      </Badge>
                    )}
                    {businessType && (
                      <Badge variant="outline" className="text-xs">
                        {businessType.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Extracted brand summary */}
              {(logo || scrapedData?.branding?.colors?.primary) && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border mb-8"
                >
                  {logo ? (
                    <img src={logo} alt="" className="h-10 w-10 object-contain rounded-lg bg-muted p-1" />
                  ) : (
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {clientName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{url}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {scrapedData?.branding?.colors?.primary && (
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: scrapedData.branding.colors.primary }}
                      />
                    )}
                    {scrapedData?.branding?.colors?.secondary && (
                      <div 
                        className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                        style={{ backgroundColor: scrapedData.branding.colors.secondary }}
                      />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Template grid */}
              <RadioGroup value={template} onValueChange={setTemplate}>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((t, i) => (
                    <motion.label
                      key={t.id}
                      htmlFor={t.id}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      className="group cursor-pointer"
                    >
                      <div className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all duration-300",
                        template === t.id 
                          ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]" 
                          : "border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.01]"
                      )}>
                        {isRecommended(t.id) && (
                          <div className="absolute top-2 right-2 z-10">
                            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] px-2 py-0.5 flex items-center gap-1">
                              <Star className="w-3 h-3" /> AI Pick
                            </Badge>
                          </div>
                        )}
                        {t.renderPreview()}
                        <div className="p-3 bg-card flex items-start gap-2.5">
                          <RadioGroupItem value={t.id} id={t.id} className="mt-0.5" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-foreground">{t.name}</div>
                            <div className="text-xs text-muted-foreground">{t.desc}</div>
                          </div>
                        </div>
                      </div>
                    </motion.label>
                  ))}
                </div>
              </RadioGroup>

              {/* Create button */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8"
              >
                <Button 
                  onClick={handleSave} 
                  disabled={isLoading} 
                  className="w-full h-12 text-base font-medium" 
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Create Pitch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}

          {/* ========== COMPLETE ========== */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-24 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="h-10 w-10 text-primary-foreground" />
              </motion.div>
              <h3 className="text-2xl font-semibold text-foreground mb-2">Pitch Created!</h3>
              <p className="text-muted-foreground">
                Redirecting to dashboard...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
