'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HeroSection } from '@/components/preview/HeroSection';
import { AboutSection } from '@/components/preview/AboutSection';
import { ServicesSection } from '@/components/preview/ServicesSection';
import { GallerySection } from '@/components/preview/GallerySection';
import { InstagramFeed } from '@/components/preview/InstagramFeed';
import { TestimonialsSection } from '@/components/preview/TestimonialsSection';
import { ContactSection } from '@/components/preview/ContactSection';
import { FeedbackButton } from '@/components/preview/FeedbackButton';
import { CreatorFooter } from '@/components/preview/CreatorFooter';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { 
  getSectionOrder, 
  getAdaptedContent, 
  getBusinessIntelligence,
  type ProcessedSchema 
} from '@/lib/businessIntelligence';
import { getIndustryColors } from '@/lib/industryColors';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

// Track visit to this preview
const trackVisit = async (previewId: string) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/track-visit`,
      {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          preview_id: previewId,
          referrer: document.referrer || null,
        }),
      }
    );
    if (!response.ok) {
      console.log('Visit tracking failed:', await response.text());
    }
  } catch (error) {
    console.log('Visit tracking error:', error);
  }
};

export default function Preview() {
  const { slug, userPrefix, clientSlug } = useParams<{ 
    slug?: string; 
    userPrefix?: string; 
    clientSlug?: string; 
  }>();
  const { toast } = useToast();
  const [preview, setPreview] = useState<ClientPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const hasTracked = useRef(false);

  // Determine the full slug to search for
  const fullSlug = slug || (userPrefix && clientSlug ? `${userPrefix}/${clientSlug}` : null);

  useEffect(() => {
    fetchPreview();
  }, [fullSlug]);

  // Track visit when preview loads
  useEffect(() => {
    if (preview && !hasTracked.current) {
      hasTracked.current = true;
      trackVisit(preview.id);
    }
  }, [preview]);

  const fetchPreview = async () => {
    if (!fullSlug) return;

    const { data, error } = await supabase
      .from('client_previews')
      .select('*')
      .eq('slug', fullSlug)
      .maybeSingle();

    if (error) {
      toast({
        title: 'Error loading preview',
        description: error.message,
        variant: 'destructive',
      });
    } else if (!data) {
      toast({
        title: 'Preview not found',
        description: 'This preview link may be invalid or expired.',
        variant: 'destructive',
      });
    } else {
      setPreview(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-background/20 border-t-background rounded-full animate-spin mx-auto mb-4" />
          <p className="text-background/60">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-foreground flex items-center justify-center">
        <div className="text-center text-background">
          <h1 className="text-4xl font-black mb-4">Preview niet gevonden</h1>
          <p className="text-background/60">Deze preview link is mogelijk ongeldig of verlopen.</p>
        </div>
      </div>
    );
  }

  const schema = preview.processed_schema as unknown as ProcessedSchema;
  const brandColors = preview.brand_colors as any;
  const templateId = (preview.template_id || 'corporate-classic') as TemplateId;
  const template = getTemplateStyle(templateId);

  // Get business intelligence and adapted content
  const businessIntelligence = getBusinessIntelligence(schema);
  const adaptedContent = getAdaptedContent(schema);
  const sectionOrder = getSectionOrder(schema);

  // Extract colors from multiple sources with intelligent fallbacks
  const firecrawlColors = (brandColors?.colors || brandColors?.branding?.colors || {}) as Record<string, string | undefined>;
  const aiColors = schema?.brandColors;
  const industryFallback = getIndustryColors(businessIntelligence.industry);
  
  // Priority: AI-validated colors > Firecrawl colors > Industry defaults
  const primaryColor = aiColors?.primary || firecrawlColors?.primary || industryFallback.primary;
  const secondaryColor = aiColors?.secondary || firecrawlColors?.secondary || industryFallback.secondary;
  const accentColor = aiColors?.accent || firecrawlColors?.accent || primaryColor || industryFallback.accent;
  const backgroundColor = aiColors?.background || firecrawlColors?.background || null;
  const textColor = aiColors?.textPrimary || firecrawlColors?.textPrimary || null;
  const colorScheme = aiColors?.colorScheme || 'light';
  
  // Get logo from schema or branding data
  const logo = schema?.logo || brandColors?.logo || brandColors?.branding?.logo || brandColors?.branding?.images?.logo || null;

  console.log('Brand colors - Primary:', primaryColor, 'Secondary:', secondaryColor, 'Source:', aiColors?.primary ? 'AI' : firecrawlColors?.primary ? 'Firecrawl' : 'Industry fallback');

  // Create CSS variables for brand colors
  const brandStyles = {
    '--brand-primary': primaryColor || 'hsl(var(--primary))',
    '--brand-secondary': secondaryColor || 'hsl(var(--secondary))',
    '--brand-accent': accentColor || primaryColor || 'hsl(var(--accent))',
    '--brand-background': backgroundColor || 'hsl(var(--background))',
    '--brand-text': textColor || 'hsl(var(--foreground))',
  } as React.CSSProperties;

  console.log('Template:', templateId, 'Business:', businessIntelligence.businessType, 'Industry:', businessIntelligence.industry);
  console.log('Section order:', sectionOrder);

  // Build section components map
  const sectionComponents: Record<string, React.ReactNode> = {
    about: (
      <AboutSection
        key="about"
        title={adaptedContent.aboutTitle}
        description={schema?.about?.description || 'Wij bieden uitzonderlijke diensten om uw bedrijf te laten groeien.'}
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
        title={adaptedContent.servicesTitle}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    gallery: (
      <GallerySection
        key="gallery"
        images={schema?.gallery?.images || []}
        title={adaptedContent.galleryTitle}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
    testimonials: (
      <TestimonialsSection
        key="testimonials"
        testimonials={schema?.testimonials || []}
        title={adaptedContent.testimonialsTitle}
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
        title={adaptedContent.contactTitle}
        primaryColor={primaryColor}
        templateId={templateId}
      />
    ),
  };

  return (
    <div className="min-h-screen bg-background" style={brandStyles}>
      {/* Hero is always first */}
      <HeroSection
        companyName={schema?.companyName}
        headline={schema?.hero?.headline || 'Welkom op uw nieuwe website'}
        subheadline={schema?.hero?.subheadline || 'Een professionele online aanwezigheid voor uw bedrijf'}
        ctaText={schema?.hero?.ctaText || 'Aan de slag'}
        logo={logo}
        backgroundImages={schema?.hero?.backgroundImages}
        primaryColor={primaryColor}
        templateId={templateId}
        classifiedImages={schema?.classifiedImages}
        fallbackPattern={schema?.hero?.fallbackPattern}
        industry={businessIntelligence.industry}
      />

      {/* Render sections in AI-recommended order */}
      {sectionOrder.map((section) => sectionComponents[section])}

      {/* Instagram Feed - separate from ordered sections */}
      <InstagramFeed
        handle={schema?.instagram?.handle}
        posts={schema?.instagram?.posts || []}
        primaryColor={primaryColor}
      />

      <FeedbackButton previewId={preview.id} primaryColor={primaryColor} />

      {/* Creator Footer */}
      <CreatorFooter 
        userId={preview.user_id}
        primaryColor={primaryColor}
        clientLogo={logo}
        clientName={schema?.companyName}
      />
    </div>
  );
}
