import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PitchLogo } from '@/components/ui/PitchLogo';
import { HeroSection } from '@/components/preview/HeroSection';
import { AboutSection } from '@/components/preview/AboutSection';
import { ServicesSection } from '@/components/preview/ServicesSection';
import { GallerySection } from '@/components/preview/GallerySection';
import { TestimonialsSection } from '@/components/preview/TestimonialsSection';
import { ContactSection } from '@/components/preview/ContactSection';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import {
  getSectionOrder,
  getAdaptedContent,
  getBusinessIntelligence,
  type ProcessedSchema,
} from '@/lib/businessIntelligence';
import { getIndustryColors } from '@/lib/industryColors';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Globe,
  Loader2,
  Sparkles,
  ArrowRight,
  Mail,
  Lock,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type DemoStep = 'input' | 'scanning' | 'gated' | 'revealed';

export default function Demo() {
  const { toast } = useToast();
  const [step, setStep] = useState<DemoStep>('input');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [scanPhase, setScanPhase] = useState<'connecting' | 'extracting' | 'processing'>('connecting');

  // Preview data
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [processedSchema, setProcessedSchema] = useState<ProcessedSchema | null>(null);

  const handleScan = async () => {
    if (!url) {
      toast({ title: 'Enter a URL', description: 'Please enter the website you want to transform.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    setStep('scanning');
    setScanPhase('connecting');

    try {
      await new Promise(r => setTimeout(r, 1200));
      setScanPhase('extracting');

      const scrapeResult = await firecrawlApi.scrape(url, {
        formats: ['markdown', 'html', 'links', 'branding'],
      });

      if (!scrapeResult.success) throw new Error(scrapeResult.error || 'Failed to scrape website');

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

      setProcessedSchema(processedResult.schema as ProcessedSchema);
      setStep('gated');
    } catch (error) {
      console.error('Demo scan error:', error);
      toast({
        title: 'Error analyzing website',
        description: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async () => {
    if (!email || !email.includes('@')) {
      toast({ title: 'Valid email required', description: 'Enter your email address to see the full result.', variant: 'destructive' });
      return;
    }

    setIsUnlocking(true);

    try {
      // Store the demo lead
      await supabase.from('demo_leads' as any).insert({
        email,
        url_submitted: url,
      });

      setStep('revealed');
    } catch (err) {
      console.error('Error saving demo lead:', err);
      // Still reveal even if save fails - UX first
      setStep('revealed');
    } finally {
      setIsUnlocking(false);
    }
  };

  // Build preview rendering data
  const schema = processedSchema;
  const brandColors = scrapedData?.branding;
  const primaryColor = schema?.brandColors?.primary || brandColors?.colors?.primary || '#4F46E5';
  const secondaryColor = schema?.brandColors?.secondary || brandColors?.colors?.secondary || '#6366f1';
  const accentColor = schema?.brandColors?.accent || primaryColor;
  const templateId: TemplateId = (schema?.businessIntelligence?.recommendedTemplate as TemplateId) || 'corporate-classic';

  const businessIntelligence = schema ? getBusinessIntelligence(schema) : null;
  const adaptedContent = schema ? getAdaptedContent(schema) : null;
  const sectionOrder = schema ? getSectionOrder(schema) : [];
  const logo = schema?.logo || brandColors?.logo || brandColors?.images?.logo || null;

  const brandStyles = {
    '--brand-primary': primaryColor,
    '--brand-secondary': secondaryColor,
    '--brand-accent': accentColor,
    '--brand-background': 'hsl(var(--background))',
    '--brand-text': 'hsl(var(--foreground))',
  } as React.CSSProperties;

  const sectionComponents: Record<string, React.ReactNode> = schema ? {
    about: (
      <AboutSection
        key="about"
        title={adaptedContent?.aboutTitle || 'About'}
        description={schema?.about?.description || ''}
        valueProps={schema?.about?.valueProps}
        stats={schema?.about?.stats}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    services: (
      <ServicesSection
        key="services"
        services={schema?.services || []}
        title={adaptedContent?.servicesTitle || 'Services'}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    gallery: (
      <GallerySection
        key="gallery"
        images={schema?.gallery?.images || []}
        title={adaptedContent?.galleryTitle || 'Gallery'}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    testimonials: (
      <TestimonialsSection
        key="testimonials"
        testimonials={schema?.testimonials || []}
        title={adaptedContent?.testimonialsTitle || 'Testimonials'}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    contact: (
      <ContactSection
        key="contact"
        email={schema?.contact?.email}
        phone={schema?.contact?.phone}
        address={schema?.contact?.address}
        instagram={schema?.contact?.instagram}
        facebook={schema?.contact?.facebook}
        title={adaptedContent?.contactTitle || 'Contact'}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
  } : {};

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl px-1">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between"
        >
          <Link to="/">
            <PitchLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-xl text-foreground/70 hover:text-foreground">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild className="rounded-xl">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </div>
        </motion.div>
      </header>

      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-32 pb-20 px-6"
          >
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
              >
                <Sparkles className="h-4 w-4" />
                Free Demo — No signup needed
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl sm:text-5xl font-bold text-foreground tracking-tight mb-4"
              >
                See your website{' '}
                <span className="text-primary">reimagined</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto"
              >
                Enter any website URL and watch our AI rebuild it with a stunning premium template in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative max-w-xl mx-auto"
              >
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && url) handleScan(); }}
                      className="h-14 pl-12 text-base rounded-xl border-border/80 focus:border-primary bg-card shadow-sm"
                    />
                  </div>
                  <Button
                    onClick={handleScan}
                    disabled={isLoading || !url}
                    size="lg"
                    className="h-14 px-8 rounded-xl text-base font-medium shadow-md shadow-primary/20"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Transform
                  </Button>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-xs text-muted-foreground mt-4"
              >
                Works with any live website · Takes about 30 seconds
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* Step 2: Scanning animation */}
        {step === 'scanning' && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pt-32 pb-20 px-6 flex items-center justify-center min-h-screen"
          >
            <div className="text-center max-w-md mx-auto">
              <div className="relative mb-8">
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Globe className="h-10 w-10 text-primary" />
                </motion.div>
                <motion.div
                  className="absolute -inset-4 rounded-3xl border-2 border-primary/20"
                  animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <h2 className="text-xl font-semibold text-foreground mb-2">
                {scanPhase === 'connecting' && 'Connecting to website...'}
                {scanPhase === 'extracting' && 'Extracting content & brand...'}
                {scanPhase === 'processing' && 'AI is building your preview...'}
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
                {scanPhase === 'connecting' && 'Establishing a secure connection'}
                {scanPhase === 'extracting' && 'Pulling colors, images, and content'}
                {scanPhase === 'processing' && 'Organizing everything into a premium layout'}
              </p>

              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">This takes about 30 seconds</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Gated — blurred preview + email capture */}
        {step === 'gated' && processedSchema && (
          <motion.div
            key="gated"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative"
          >
            {/* Blurred preview */}
            <div className="blur-[8px] pointer-events-none select-none" style={brandStyles}>
              <HeroSection
                companyName={schema?.companyName}
                headline={schema?.hero?.headline || 'Welcome'}
                subheadline={schema?.hero?.subheadline || ''}
                ctaText={schema?.hero?.ctaText || 'Get Started'}
                logo={logo}
                backgroundImages={schema?.hero?.backgroundImages}
                primaryColor={primaryColor}
                templateId={templateId}
                classifiedImages={schema?.classifiedImages}
                fallbackPattern={schema?.hero?.fallbackPattern}
                industry={businessIntelligence?.industry}
              />
              {sectionOrder.slice(0, 2).map((section) => sectionComponents[section])}
            </div>

            {/* Overlay with email capture */}
            <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
              >
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-7 w-7 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Your preview is ready!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your email to see the full redesigned website. No spam, just inspiration.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && email) handleUnlock(); }}
                      className="h-12 pl-10 text-base rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={handleUnlock}
                    disabled={isUnlocking || !email}
                    className="w-full h-12 text-base font-medium rounded-xl shadow-md shadow-primary/20"
                  >
                    {isUnlocking ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Unlocking...</>
                    ) : (
                      <><Lock className="h-4 w-4 mr-2" /> Reveal Full Preview</>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1">
                  <Lock className="h-3 w-3" />
                  We respect your privacy. No spam ever.
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Revealed — full preview */}
        {step === 'revealed' && processedSchema && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Success banner */}
            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card border border-border shadow-lg rounded-xl px-5 py-3 flex items-center gap-3"
              >
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Preview unlocked!</span>
                <Button size="sm" asChild className="rounded-lg ml-2">
                  <Link to="/auth">
                    Create yours free
                    <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Full preview */}
            <div className="pt-20" style={brandStyles}>
              <HeroSection
                companyName={schema?.companyName}
                headline={schema?.hero?.headline || 'Welcome'}
                subheadline={schema?.hero?.subheadline || ''}
                ctaText={schema?.hero?.ctaText || 'Get Started'}
                logo={logo}
                backgroundImages={schema?.hero?.backgroundImages}
                primaryColor={primaryColor}
                templateId={templateId}
                classifiedImages={schema?.classifiedImages}
                fallbackPattern={schema?.hero?.fallbackPattern}
                industry={businessIntelligence?.industry}
              />
              {sectionOrder.map((section) => sectionComponents[section])}
            </div>

            {/* CTA footer */}
            <div className="bg-muted/50 border-t border-border py-16 px-6">
              <div className="max-w-xl mx-auto text-center">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  Like what you see?
                </h2>
                <p className="text-muted-foreground mb-6">
                  Create unlimited pitch previews like this for your clients. Start for free today.
                </p>
                <Button size="lg" asChild className="rounded-xl h-12 px-8 shadow-md shadow-primary/20">
                  <Link to="/auth">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
