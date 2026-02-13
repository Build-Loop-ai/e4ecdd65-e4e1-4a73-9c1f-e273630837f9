import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { generateImages, type MissingImages } from '@/lib/imageGeneration';
import { getSuitableHeroImages } from '@/lib/businessIntelligence';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useSubscription, PLAN_LIMITS } from '@/hooks/useSubscription';
import { UpgradeBanner } from '@/components/ui/UpgradeBanner';
import { generatePitchSlug } from '@/lib/slugUtils';
import { 
  Globe, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Palette,
  Image,
  FileText,
  Zap,
  Building2,
  Link2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDUSTRY_DISPLAY_NAMES, type IndustryType } from '@/lib/templateStyles';
import { cn } from '@/lib/utils';

type Step = 'input' | 'scanning' | 'template' | 'complete';

interface LocationState {
  prefilledUrl?: string;
  clientName?: string;
  leadId?: string;
}

const STEPS = [
  { key: 'input', label: 'Details', icon: Building2 },
  { key: 'scanning', label: 'Analyze', icon: Sparkles },
  { key: 'template', label: 'Template', icon: Palette },
  { key: 'complete', label: 'Done', icon: CheckCircle2 },
] as const;

const EXTRACT_FEATURES = [
  { icon: Palette, label: 'Brand colors', desc: 'Primary & secondary palette' },
  { icon: Image, label: 'Images & logo', desc: 'Visual assets & branding' },
  { icon: FileText, label: 'Content & copy', desc: 'Headlines, services, about' },
  { icon: Zap, label: 'Business type', desc: 'Industry classification' },
];

export default function NewPitch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { subscription, canCreatePitch, incrementPitchUsage } = useSubscription();
  
  const locationState = location.state as LocationState | null;
  const autoStartRef = useRef(false);
  
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState(locationState?.prefilledUrl || '');
  const [clientName, setClientName] = useState(locationState?.clientName || '');
  const [leadId, setLeadId] = useState<string | null>(locationState?.leadId || null);
  const [template, setTemplate] = useState('corporate-classic');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [processedSchema, setProcessedSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState<'connecting' | 'extracting' | 'processing' | 'generating'>('connecting');
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

  // Auto-start scraping if coming from leads page with prefilled data
  useEffect(() => {
    if (locationState?.prefilledUrl && locationState?.clientName && !autoStartRef.current) {
      autoStartRef.current = true;
      setTimeout(() => {
        handleScrapeAuto(locationState.prefilledUrl!, locationState.clientName!);
      }, 500);
    }
  }, [locationState]);

  // Auto-select recommended template
  useEffect(() => {
    if (processedSchema?.businessIntelligence?.recommendedTemplate) {
      setTemplate(processedSchema.businessIntelligence.recommendedTemplate);
    }
  }, [processedSchema]);

  const generateMissingImages = async (schema: any, brandData: any) => {
    const bi = schema?.businessIntelligence;
    const heroImgs = getSuitableHeroImages(schema);
    const galleryImgs = schema?.gallery?.images || [];
    const servicesWithoutImages = (schema?.services || [])
      .filter((s: any) => !s.image)
      .map((s: any) => s.title)
      .filter(Boolean)
      .slice(0, 4);

    const missingImages: MissingImages = {
      hero: heroImgs.length === 0,
      gallery: Math.max(0, 3 - galleryImgs.length),
      services: servicesWithoutImages,
    };

    if (!missingImages.hero && missingImages.gallery === 0 && missingImages.services.length === 0) {
      return schema;
    }

    setScanPhase('generating');
    const pc = brandData?.colors?.primary || schema?.brandColors?.primary || '#6366f1';

    try {
      const genResult = await generateImages({
        businessType: bi?.businessType || 'general',
        industry: bi?.industry || 'other',
        companyName: schema?.companyName || 'Business',
        primaryColor: pc,
        missingImages,
      });

      if (genResult.success && genResult.generatedImages) {
        const gi = genResult.generatedImages;
        const updated = { ...schema };

        if (gi.hero) {
          if (!updated.hero) updated.hero = { headline: '', subheadline: '', ctaText: '' };
          updated.hero.backgroundImages = [gi.hero, ...(updated.hero.backgroundImages || [])];
          if (!updated.classifiedImages) updated.classifiedImages = [];
          updated.classifiedImages.push({ url: gi.hero, classification: 'hero', confidence: 0.95, hasText: false });
        }
        if (gi.gallery?.length) {
          if (!updated.gallery) updated.gallery = { images: [], title: 'Gallery' };
          updated.gallery.images = [...(updated.gallery.images || []), ...gi.gallery];
        }
        if (gi.services && Object.keys(gi.services).length > 0) {
          updated.services = (updated.services || []).map((s: any) => {
            if (!s.image && gi.services[s.title]) {
              return { ...s, image: gi.services[s.title] };
            }
            return s;
          });
        }
        return updated;
      }
    } catch (e) {
      console.error('Image generation failed:', e);
    }
    return schema;
  };

  const handleScrapeAuto = async (autoUrl: string, autoClientName: string) => {
    setIsLoading(true);
    setStep('scanning');
    setScanPhase('connecting');

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setScanPhase('extracting');
      
      const scrapeResult = await firecrawlApi.scrape(autoUrl, {
        formats: ['markdown', 'html', 'links', 'branding'],
      });

      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error || 'Failed to scrape website');
      }

      const scraped = scrapeResult.data || scrapeResult;
      setScrapedData(scraped);
      
      setScanPhase('processing');

      const { data: processedResult, error: processError } = await supabase.functions.invoke(
        'process-content',
        { body: { scrapedContent: scraped, brandColors: scraped.branding } }
      );

      if (processError || !processedResult?.success) {
        throw new Error(processError?.message || processedResult?.error || 'AI processing failed');
      }

      const schemaWithImages = await generateMissingImages(processedResult.schema, scraped.branding);
      setProcessedSchema(schemaWithImages);
      setStep('template');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error analyzing website',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScrape = async () => {
    if (!url || !clientName) {
      toast({
        title: 'Missing information',
        description: 'Please enter both company name and website URL.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setStep('scanning');
    setScanPhase('connecting');

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setScanPhase('extracting');
      
      const scrapeResult = await firecrawlApi.scrape(url, {
        formats: ['markdown', 'html', 'links', 'branding'],
      });

      if (!scrapeResult.success) {
        throw new Error(scrapeResult.error || 'Failed to scrape website');
      }

      const scraped = scrapeResult.data || scrapeResult;
      setScrapedData(scraped);
      
      setScanPhase('processing');

      const { data: processedResult, error: processError } = await supabase.functions.invoke(
        'process-content',
        { body: { scrapedContent: scraped, brandColors: scraped.branding } }
      );

      if (processError || !processedResult?.success) {
        throw new Error(processError?.message || processedResult?.error || 'AI processing failed');
      }

      const schemaWithImages = await generateMissingImages(processedResult.schema, scraped.branding);
      setProcessedSchema(schemaWithImages);
      setStep('template');
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error analyzing website',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    if (!canCreatePitch()) {
      toast({
        title: 'Pitch limit reached',
        description: `You've used all ${PLAN_LIMITS[subscription.plan].pitches} pitches this month. Upgrade your plan for more.`,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const baseSlug = generatePitchSlug(clientName, userProfile?.full_name, user.email);
      // Append short random suffix to avoid duplicate slug conflicts
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

      const { data: newPreview, error } = await supabase.from('client_previews').insert({
        user_id: user.id,
        slug,
        client_name: clientName,
        original_url: url,
        template_id: template,
        scraped_content: scrapedData,
        processed_schema: processedSchema,
        brand_colors: scrapedData?.branding || null,
        status: 'draft',
      }).select().single();

      if (error) throw error;

      await incrementPitchUsage();

      if (leadId && newPreview) {
        await supabase
          .from('leads')
          .update({ preview_id: newPreview.id, status: 'pitched' })
          .eq('id', leadId)
          .eq('user_id', user.id);
      }

      setStep('complete');
      
      setTimeout(() => {
        navigate('/dashboard/previews');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error saving pitch',
        description: error instanceof Error ? error.message : 'Failed to save',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extracted data
  const primaryColor = scrapedData?.branding?.colors?.primary || '#6366f1';
  const logo = scrapedData?.branding?.logo || scrapedData?.branding?.images?.logo;
  const businessIntelligence = processedSchema?.businessIntelligence;
  const recommendedTemplate = businessIntelligence?.recommendedTemplate;
  const industry = businessIntelligence?.industry as IndustryType | undefined;
  const industryDisplayName = industry ? INDUSTRY_DISPLAY_NAMES[industry] || industry : null;

  const isRecommended = (templateId: string) => templateId === recommendedTemplate;

  const templates = [
    { id: 'corporate-classic', name: 'Corporate Classic', desc: 'Law, consulting, B2B', emoji: '🏛️' },
    { id: 'modern-professional', name: 'Modern Professional', desc: 'Tech, SaaS, startups', emoji: '⚡' },
    { id: 'bold-starter', name: 'Bold Starter', desc: 'Agencies, creatives', emoji: '🎯' },
    { id: 'elegant-minimal', name: 'Elegant Minimal', desc: 'Luxury, fashion', emoji: '✨' },
    { id: 'warm-friendly', name: 'Warm Friendly', desc: 'Healthcare, local biz', emoji: '🤝' },
  ];

  const currentStepIndex = STEPS.findIndex(s => s.key === step);

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>

        {/* Hero header */}
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Create New Pitch</h1>
          <p className="text-muted-foreground mt-2 text-base">
            Enter a website URL and we'll build a stunning pitch in seconds.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-1 mb-10">
          {STEPS.map((s, i) => {
            const isComplete = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            const StepIcon = s.icon;
            return (
              <div key={s.key} className="flex items-center gap-1">
                <motion.div
                  animate={{
                    scale: isCurrent ? 1 : 0.9,
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    isComplete ? "bg-primary text-primary-foreground" :
                    isCurrent ? "bg-primary/15 text-primary ring-1 ring-primary/30" :
                    "bg-muted text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <StepIcon className="h-3.5 w-3.5" />
                  )}
                  <span className="hidden sm:inline">{s.label}</span>
                </motion.div>
                {i < STEPS.length - 1 && (
                  <div className={cn(
                    "w-6 h-px mx-0.5",
                    i < currentStepIndex ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Input */}
          {step === 'input' && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Main input card */}
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-sm overflow-hidden">
                {/* Subtle gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/60 via-primary to-primary/60" />
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="clientName" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      Company Name
                    </label>
                    <Input
                      id="clientName"
                      placeholder="Acme Corporation"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="h-12 text-base border-border/80 focus:border-primary bg-background"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Link2 className="h-4 w-4 text-primary" />
                      Website URL
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground" />
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="h-12 pl-11 text-base border-border/80 focus:border-primary bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && url && clientName) handleScrape();
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Extract features grid */}
              <div className="grid grid-cols-2 gap-3">
                {EXTRACT_FEATURES.map((item, i) => (
                  <motion.div 
                    key={item.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05 }}
                    className="flex items-start gap-3 p-3.5 rounded-xl border border-border bg-card hover:border-primary/20 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button
                onClick={handleScrape}
                disabled={isLoading || !url || !clientName}
                className="w-full h-12 text-base font-medium shadow-sm shadow-primary/20"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Analyze Website
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 2: Scanning */}
          {step === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-2xl p-10 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center py-4">
                {/* Animated scanner */}
                <div className="relative mb-10">
                  <motion.div 
                    className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Loader2 className="h-12 w-12 text-primary animate-spin" />
                  </motion.div>
                  <motion.div
                    className="absolute -inset-3 rounded-3xl border-2 border-primary/20"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute -inset-6 rounded-[1.75rem] border border-primary/10"
                    animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.05, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.3 }}
                  />
                </div>

                <div className="text-center space-y-1.5 mb-10">
                  <h3 className="text-xl font-semibold text-foreground">
                    {scanPhase === 'connecting' && 'Connecting to website...'}
                    {scanPhase === 'extracting' && 'Extracting content...'}
                    {scanPhase === 'processing' && 'AI is analyzing...'}
                    {scanPhase === 'generating' && 'Generating visuals...'}
                  </h3>
                  <p className="text-sm text-muted-foreground font-mono">{url}</p>
                </div>

                {/* Progress steps */}
                <div className="w-full max-w-sm space-y-2">
                  {[
                    { key: 'connecting', label: 'Connect to website' },
                    { key: 'extracting', label: 'Extract content & assets' },
                    { key: 'processing', label: 'AI content analysis' },
                    { key: 'generating', label: 'Generate missing visuals' },
                  ].map((phase, index) => {
                    const phases = ['connecting', 'extracting', 'processing', 'generating'];
                    const currentIndex = phases.indexOf(scanPhase);
                    const isComplete = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    
                    return (
                      <motion.div 
                        key={phase.key} 
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl transition-colors",
                          isCurrent ? "bg-primary/5" : "bg-transparent"
                        )}
                        animate={isCurrent ? { x: [0, 2, 0] } : {}}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-full flex items-center justify-center transition-all",
                          isComplete ? "bg-primary text-primary-foreground" : 
                          isCurrent ? "bg-primary/20 text-primary ring-2 ring-primary/30" : 
                          "bg-muted text-muted-foreground"
                        )}>
                          {isComplete ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : isCurrent ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <span className="text-xs font-medium">{index + 1}</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-sm font-medium",
                          isComplete ? "text-foreground" : 
                          isCurrent ? "text-foreground" : 
                          "text-muted-foreground"
                        )}>
                          {phase.label}
                        </span>
                        {isComplete && (
                          <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="ml-auto text-xs text-primary font-medium"
                          >
                            Done
                          </motion.span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Template Selection */}
          {step === 'template' && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Extracted info summary */}
              <div className="flex items-center gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded-xl bg-background p-1.5 border border-border" />
                ) : (
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {clientName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{clientName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {industryDisplayName && (
                      <Badge variant="secondary" className="text-xs">
                        {industryDisplayName}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">Analysis complete</span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {scrapedData?.branding?.colors?.primary && (
                    <div 
                      className="w-7 h-7 rounded-full border-2 border-background shadow-sm ring-1 ring-border"
                      style={{ backgroundColor: scrapedData.branding.colors.primary }}
                    />
                  )}
                  {scrapedData?.branding?.colors?.secondary && (
                    <div 
                      className="w-7 h-7 rounded-full border-2 border-background shadow-sm ring-1 ring-border"
                      style={{ backgroundColor: scrapedData.branding.colors.secondary }}
                    />
                  )}
                </div>
              </div>

              {/* Template grid */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">Choose a template</p>
                <RadioGroup value={template} onValueChange={setTemplate} className="space-y-2.5">
                  {templates.map((t, i) => (
                    <motion.label
                      key={t.id}
                      htmlFor={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all bg-card group",
                        template === t.id 
                          ? "border-primary shadow-sm shadow-primary/10" 
                          : "border-border hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      <RadioGroupItem value={t.id} id={t.id} className="sr-only" />
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-transform group-hover:scale-105",
                        template === t.id ? "bg-primary/10" : "bg-muted"
                      )}>
                        {t.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{t.name}</span>
                          {isRecommended(t.id) && (
                            <Badge className="bg-primary/15 text-primary hover:bg-primary/20 border-0 text-[10px] px-2 py-0.5 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-primary" /> AI Pick
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{t.desc}</p>
                      </div>
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                        template === t.id 
                          ? "border-primary bg-primary" 
                          : "border-muted-foreground/30"
                      )}>
                        {template === t.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 rounded-full bg-primary-foreground"
                          />
                        )}
                      </div>
                    </motion.label>
                  ))}
                </RadioGroup>
              </div>

              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="w-full h-12 text-base font-medium shadow-sm shadow-primary/20"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Pitch...
                  </>
                ) : (
                  <>
                    Create Pitch
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {/* Step 4: Complete */}
          {step === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="bg-card border border-border rounded-2xl p-10 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 12, delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"
                >
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.h3 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="text-2xl font-bold text-foreground mb-2"
                >
                  Pitch Created!
                </motion.h3>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="text-muted-foreground"
                >
                  Taking you to your pitches...
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
