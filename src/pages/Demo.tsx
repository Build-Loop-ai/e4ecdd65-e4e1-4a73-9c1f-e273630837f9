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
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw,
  Zap,
  Code2,
  Palette,
  Share2,
  Download,
  ScanLine,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import heroGradient from '@/assets/hero-gradient.png';

type DemoStep = 'input' | 'scanning' | 'gated' | 'revealed';
type DeviceView = 'desktop' | 'tablet' | 'mobile';

const DEVICE_WIDTHS: Record<DeviceView, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export default function Demo() {
  const { toast } = useToast();
  const [step, setStep] = useState<DemoStep>('input');
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [scanPhase, setScanPhase] = useState<'connecting' | 'extracting' | 'processing'>('connecting');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');

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
      await supabase.from('demo_leads' as any).insert({
        email,
        url_submitted: url,
      });

      setStep('revealed');
    } catch (err) {
      console.error('Error saving demo lead:', err);
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

  const showPreview = step === 'gated' || step === 'revealed';

  // Renders the full preview content
  const renderPreview = () => (
    <div style={brandStyles}>
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
  );

  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      {/* Full-cover hero background image */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroGradient})` }}
      />
      {/* Subtle overlay for text contrast only */}
      <div className="fixed inset-0 bg-black/10" />

      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl px-1">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white backdrop-blur-xl rounded-2xl px-4 sm:px-6 h-14 flex items-center justify-between shadow-lg"
        >
          <Link to="/">
            <PitchLogo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="rounded-xl text-foreground/60 hover:text-foreground hover:bg-muted">
              <Link to="/auth">Log in</Link>
            </Button>
            <Button size="sm" asChild className="rounded-xl bg-primary hover:bg-primary/90">
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
            className="pt-32 pb-20 px-6 relative z-10"
          >
            <div className="max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-medium mb-6"
              >
                <Zap className="h-4 w-4" />
                Free Demo — No signup needed
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl font-bold tracking-tight mb-5"
              >
                <span className="text-white">See your website </span>
                <span className="text-white">
                  reimagined
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/80 mb-10 max-w-lg mx-auto"
              >
                Enter any website URL and watch our AI rebuild it with a stunning premium template in seconds.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative max-w-xl mx-auto"
              >
                <div className="relative flex gap-3 bg-white/20 backdrop-blur-md rounded-2xl p-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && url) handleScan(); }}
                      className="h-12 pl-12 text-base rounded-xl border-0 bg-transparent text-white placeholder:text-white/50 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                  </div>
                  <Button
                    onClick={handleScan}
                    disabled={isLoading || !url}
                    size="lg"
                    className="h-12 px-8 rounded-xl text-base font-medium shadow-lg bg-white/25 hover:bg-white/35 text-white backdrop-blur-sm"
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
                className="text-xs text-white/60 mt-4"
              >
                Works with any live website · Takes about 30 seconds
              </motion.p>

              {/* Feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap items-center justify-center gap-3 mt-12"
              >
                {[
                  { icon: ScanLine, label: 'AI Content Extraction' },
                  { icon: Palette, label: 'Brand Matching' },
                  { icon: Code2, label: '5 Premium Templates' },
                  { icon: Zap, label: 'Instant Results' },
                ].map((feat) => (
                  <div
                    key={feat.label}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-xs text-white/70"
                  >
                    <feat.icon className="h-3.5 w-3.5 text-white/60" />
                    {feat.label}
                  </div>
                ))}
              </motion.div>
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
            className="pt-32 pb-20 px-6 flex items-center justify-center min-h-screen relative z-10"
          >
            <div className="text-center max-w-md mx-auto">
              <div className="relative mb-8">
                {/* Pulsing rings */}
                <motion.div
                  className="absolute inset-0 w-28 h-28 mx-auto rounded-2xl border border-primary/15"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ margin: '0 auto' }}
                />
                <motion.div
                  className="absolute inset-0 w-28 h-28 mx-auto rounded-2xl border border-primary/10"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  style={{ margin: '0 auto' }}
                />
                <motion.div
                  className="w-28 h-28 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto backdrop-blur-sm"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Globe className="h-12 w-12 text-primary" />
                </motion.div>
              </div>

              <h2 className="text-xl font-semibold text-white mb-2">
                {scanPhase === 'connecting' && 'Connecting to website...'}
                {scanPhase === 'extracting' && 'Extracting content & brand...'}
                {scanPhase === 'processing' && 'AI is building your preview...'}
              </h2>
              <p className="text-white/40 text-sm mb-6">
                {scanPhase === 'connecting' && 'Establishing a secure connection'}
                {scanPhase === 'extracting' && 'Pulling colors, images, and content'}
                {scanPhase === 'processing' && 'Organizing everything into a premium layout'}
              </p>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-3 mb-6">
                {['connecting', 'extracting', 'processing'].map((phase, i) => (
                  <div key={phase} className="flex items-center gap-3">
                    <div className={cn(
                      'w-2.5 h-2.5 rounded-full transition-all duration-500',
                      scanPhase === phase ? 'bg-primary scale-125 shadow-lg shadow-primary/50' :
                      ['connecting', 'extracting', 'processing'].indexOf(scanPhase) > i ? 'bg-primary/80' : 'bg-white/10'
                    )} />
                    {i < 2 && <div className={cn(
                      'w-8 h-px transition-colors duration-500',
                      ['connecting', 'extracting', 'processing'].indexOf(scanPhase) > i ? 'bg-primary/50' : 'bg-white/10'
                    )} />}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm text-white/30">This takes about 30 seconds</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3 & 4: Preview with sidebar */}
        {showPreview && processedSchema && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex min-h-screen relative z-10"
          >
            {/* Sidebar */}
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[260px] shrink-0 bg-black/40 backdrop-blur-xl flex flex-col fixed left-0 top-0 bottom-0 z-50 overflow-y-auto"
            >
              {/* Sidebar header */}
              <div className="p-4 border-b border-white/5">
                <Link to="/">
                  <PitchLogo size="md" />
                </Link>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-white/40">Preview Live</span>
                </div>
              </div>

              {/* Device selector */}
              <div className="p-4 border-b border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium mb-3">Responsive View</p>
                <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                  {([
                    { id: 'desktop' as DeviceView, icon: Monitor, label: 'Desktop' },
                    { id: 'tablet' as DeviceView, icon: Tablet, label: 'Tablet' },
                    { id: 'mobile' as DeviceView, icon: Smartphone, label: 'Mobile' },
                  ]).map(({ id, icon: Icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setDeviceView(id)}
                      className={cn(
                        'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
                        deviceView === id
                          ? 'bg-primary text-white shadow-lg shadow-primary/30'
                          : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick info */}
              <div className="p-4 border-b border-white/5 space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium">Preview Info</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-white/50 truncate">{url}</span>
                  </div>
                  {schema?.companyName && (
                    <div className="flex items-center gap-2 text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-primary/60" />
                      <span className="text-white/50">{schema.companyName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <Palette className="h-3.5 w-3.5 text-primary/60" />
                    <span className="text-white/50 capitalize">{templateId.replace('-', ' ')}</span>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="p-4 border-b border-white/5">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium mb-3">Brand Colors</p>
                <div className="flex gap-2">
                  {[primaryColor, secondaryColor, accentColor].filter(Boolean).map((color, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-lg border border-white/10 shadow-lg"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-white/30 font-medium mb-3">Actions</p>
                <button
                  onClick={() => { setStep('input'); setProcessedSchema(null); setScrapedData(null); setUrl(''); setEmail(''); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Try Another URL
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <Share2 className="h-4 w-4" />
                  Share Preview
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>

              {/* CTA */}
              <div className="mt-auto p-4 border-t border-white/5">
                <div className="rounded-xl bg-primary/10 p-4">
                  <p className="text-sm font-medium text-white mb-1">Want this for your clients?</p>
                  <p className="text-xs text-white/40 mb-3">Create unlimited pitch previews.</p>
                  <Button size="sm" asChild className="w-full rounded-lg bg-primary hover:bg-primary/90">
                    <Link to="/auth">
                      Get Started Free
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Main content area */}
            <div className="flex-1 ml-[260px]">
              {/* Email gate overlay */}
              {step === 'gated' && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm ml-[260px]">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.3, type: 'spring', damping: 20 }}
                    className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
                  >
                    <div className="text-center mb-6">
                      <motion.div
                        className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >
                        <Eye className="h-8 w-8 text-primary" />
                      </motion.div>
                      <h2 className="text-2xl font-bold text-white mb-2">
                        Your preview is ready! 🎉
                      </h2>
                      <p className="text-white/40 text-sm">
                        Enter your email to see the full redesigned website. No spam, just inspiration.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && email) handleUnlock(); }}
                          className="h-12 pl-10 text-base rounded-xl bg-white/5 border-0 text-white placeholder:text-white/25 focus-visible:ring-1 focus-visible:ring-primary/50"
                        />
                      </div>
                      <Button
                        onClick={handleUnlock}
                        disabled={isUnlocking || !email}
                        className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/30 bg-primary hover:bg-primary/90"
                      >
                        {isUnlocking ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Unlocking...</>
                        ) : (
                          <><Lock className="h-4 w-4 mr-2" /> Reveal Full Preview</>
                        )}
                      </Button>
                    </div>

                    <p className="text-xs text-white/20 text-center mt-4 flex items-center justify-center gap-1">
                      <Lock className="h-3 w-3" />
                      We respect your privacy. No spam ever.
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Success toast for revealed */}
              {step === 'revealed' && (
                <div className="fixed top-4 left-[260px] right-0 z-50 flex justify-center">
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-black/60 backdrop-blur-xl shadow-2xl rounded-xl px-5 py-3 flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    <span className="text-sm font-medium text-white">Preview unlocked!</span>
                    <Button size="sm" asChild className="rounded-lg ml-2 bg-primary hover:bg-primary/90">
                      <Link to="/auth">
                        Create yours free
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Preview frame */}
              <div className="bg-black/20 min-h-screen p-4 pt-6 flex justify-center">
                <motion.div
                  layout
                  className={cn(
                    'bg-white rounded-xl overflow-hidden shadow-2xl shadow-black/40 transition-all duration-500',
                    step === 'gated' && 'blur-[8px] pointer-events-none select-none'
                  )}
                  style={{
                    width: DEVICE_WIDTHS[deviceView],
                    maxWidth: '100%',
                  }}
                >
                  {/* Browser chrome */}
                  <div className="bg-[hsl(0,0%,95%)] px-4 py-2 flex items-center gap-2 border-b border-black/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[hsl(0,70%,60%)]" />
                      <div className="w-3 h-3 rounded-full bg-[hsl(45,90%,55%)]" />
                      <div className="w-3 h-3 rounded-full bg-[hsl(120,50%,50%)]" />
                    </div>
                    <div className="flex-1 mx-3">
                      <div className="bg-white rounded-md px-3 py-1 text-xs text-black/40 truncate max-w-md mx-auto text-center">
                        {url || 'preview.pitch.io'}
                      </div>
                    </div>
                  </div>
                  {renderPreview()}
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
