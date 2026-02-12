import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useSubscription, PLAN_LIMITS } from '@/hooks/useSubscription';
import { UpgradeBanner } from '@/components/ui/UpgradeBanner';
import { generatePitchSlug } from '@/lib/slugUtils';
import { 
  Globe, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  X, 
  Star,
  Palette,
  Image,
  FileText,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INDUSTRY_DISPLAY_NAMES, type IndustryType } from '@/lib/templateStyles';
import { cn } from '@/lib/utils';

type Step = 'input' | 'scanning' | 'template' | 'complete';

interface NewPitchFlowProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const truncate = (text: string, maxLength: number) => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
};

export function NewPitchFlow({ isOpen, onClose, onComplete }: NewPitchFlowProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription, canCreatePitch, incrementPitchUsage } = useSubscription();
  
  const [step, setStep] = useState<Step>('input');
  const [url, setUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [template, setTemplate] = useState('corporate-classic');
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [processedSchema, setProcessedSchema] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanPhase, setScanPhase] = useState<'connecting' | 'extracting' | 'processing'>('connecting');
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

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep('input');
        setUrl('');
        setClientName('');
        setTemplate('corporate-classic');
        setScrapedData(null);
        setProcessedSchema(null);
      }, 300);
    }
  }, [isOpen]);

  // Auto-select recommended template
  useEffect(() => {
    if (processedSchema?.businessIntelligence?.recommendedTemplate) {
      setTemplate(processedSchema.businessIntelligence.recommendedTemplate);
    }
  }, [processedSchema]);

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

      setProcessedSchema(processedResult.schema);
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
      const slug = generatePitchSlug(clientName, userProfile?.full_name, user.email);

      const { data: insertedPreview, error } = await supabase.from('client_previews').insert({
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

      await incrementPitchUsage();

      setStep('complete');
      
      setTimeout(() => {
        onComplete();
        onClose();
        if (insertedPreview?.id) {
          navigate(`/manage/${insertedPreview.id}`);
        }
      }, 800);
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
  const headline = processedSchema?.hero?.headline || 'Your Headline';
  const heroImage = processedSchema?.hero?.backgroundImages?.[0];
  const businessIntelligence = processedSchema?.businessIntelligence;
  const recommendedTemplate = businessIntelligence?.recommendedTemplate;
  const industry = businessIntelligence?.industry as IndustryType | undefined;
  const industryDisplayName = industry ? INDUSTRY_DISPLAY_NAMES[industry] || industry : null;

  const isRecommended = (templateId: string) => templateId === recommendedTemplate;

  const templates = [
    { id: 'corporate-classic', name: 'Corporate Classic', desc: 'Law, consulting, B2B' },
    { id: 'modern-professional', name: 'Modern Professional', desc: 'Tech, SaaS, startups' },
    { id: 'bold-starter', name: 'Bold Starter', desc: 'Agencies, creatives' },
    { id: 'elegant-minimal', name: 'Elegant Minimal', desc: 'Luxury, fashion' },
    { id: 'warm-friendly', name: 'Warm Friendly', desc: 'Healthcare, local biz' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-background border-l border-border shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-xl font-semibold text-foreground">New Pitch</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {step === 'input' && 'Enter your prospect\'s website'}
                  {step === 'scanning' && 'Analyzing website...'}
                  {step === 'template' && 'Choose a template'}
                  {step === 'complete' && 'All done!'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Input */}
                {step === 'input' && (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="clientName" className="text-sm font-medium">Company Name</Label>
                        <Input
                          id="clientName"
                          placeholder="Acme Corporation"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="h-12"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="url" className="text-sm font-medium">Website URL</Label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="url"
                            type="url"
                            placeholder="https://example.com"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* What we'll extract */}
                    <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                      <p className="text-sm font-medium text-foreground">We'll extract:</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { icon: Palette, label: 'Brand colors' },
                          { icon: Image, label: 'Images & logo' },
                          { icon: FileText, label: 'Content & copy' },
                          { icon: Zap, label: 'Business type' },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <item.icon className="h-4 w-4 text-primary" />
                            {item.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Scanning */}
                {step === 'scanning' && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <div className="relative mb-8">
                      <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-primary animate-spin" />
                      </div>
                      <motion.div
                        className="absolute -inset-2 rounded-3xl border-2 border-primary/30"
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>

                    <div className="text-center space-y-2 mb-8">
                      <h3 className="text-lg font-semibold text-foreground">
                        {scanPhase === 'connecting' && 'Connecting to website...'}
                        {scanPhase === 'extracting' && 'Extracting content...'}
                        {scanPhase === 'processing' && 'AI is analyzing...'}
                      </h3>
                      <p className="text-sm text-muted-foreground">{url}</p>
                    </div>

                    {/* Progress steps */}
                    <div className="w-full max-w-xs space-y-3">
                      {['connecting', 'extracting', 'processing'].map((phase, index) => {
                        const phases = ['connecting', 'extracting', 'processing'];
                        const currentIndex = phases.indexOf(scanPhase);
                        const isComplete = index < currentIndex;
                        const isCurrent = index === currentIndex;
                        
                        return (
                          <div key={phase} className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                              isComplete ? "bg-primary text-white" : isCurrent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                              {isComplete ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <span className={cn(
                              "text-sm",
                              isComplete || isCurrent ? "text-foreground" : "text-muted-foreground"
                            )}>
                              {phase === 'connecting' && 'Connect to website'}
                              {phase === 'extracting' && 'Extract content & assets'}
                              {phase === 'processing' && 'AI content analysis'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Template Selection */}
                {step === 'template' && (
                  <motion.div
                    key="template"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    {/* Extracted info summary */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                      {logo ? (
                        <img src={logo} alt="Logo" className="h-12 w-12 object-contain rounded-lg bg-white p-1" />
                      ) : (
                        <div 
                          className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: primaryColor }}
                        >
                          {clientName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{clientName}</p>
                        {industryDisplayName && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {industryDisplayName}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {scrapedData?.branding?.colors?.primary && (
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: scrapedData.branding.colors.primary }}
                          />
                        )}
                        {scrapedData?.branding?.colors?.secondary && (
                          <div 
                            className="w-6 h-6 rounded-full border-2 border-white shadow"
                            style={{ backgroundColor: scrapedData.branding.colors.secondary }}
                          />
                        )}
                      </div>
                    </div>

                    {/* Template grid */}
                    <RadioGroup value={template} onValueChange={setTemplate} className="space-y-3">
                      {templates.map((t) => (
                        <label
                          key={t.id}
                          htmlFor={t.id}
                          className={cn(
                            "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                            template === t.id 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <RadioGroupItem value={t.id} id={t.id} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">{t.name}</span>
                              {isRecommended(t.id) && (
                                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0 flex items-center gap-0.5">
                                  <Star className="w-3 h-3" /> AI Pick
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{t.desc}</p>
                          </div>
                          {/* Mini preview */}
                          <div 
                            className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0"
                            style={{
                              background: heroImage 
                                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${heroImage}) center/cover`
                                : `linear-gradient(135deg, ${primaryColor}33 0%, ${primaryColor} 100%)`
                            }}
                          />
                        </label>
                      ))}
                    </RadioGroup>
                  </motion.div>
                )}

                {/* Step 4: Complete */}
                {step === 'complete' && (
                  <motion.div
                    key="complete"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-12"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10, stiffness: 200 }}
                      className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">Pitch Created!</h3>
                    <p className="text-muted-foreground text-center">
                      Your pitch for {clientName} is ready to share.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {step !== 'complete' && (
              <div className="p-6 border-t border-border bg-background">
                {step === 'input' && (
                  <Button 
                    onClick={handleScrape} 
                    disabled={isLoading || !url || !clientName}
                    className="w-full h-12 text-base"
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
                )}
                {step === 'template' && (
                  <Button 
                    onClick={handleSave} 
                    disabled={isLoading}
                    className="w-full h-12 text-base"
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
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
