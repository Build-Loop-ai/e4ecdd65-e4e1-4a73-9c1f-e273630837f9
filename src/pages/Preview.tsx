'use client';

import { useEffect, useState } from 'react';
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
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

interface ProcessedSchema {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
    backgroundImages?: string[];
  };
  about: {
    title: string;
    description: string;
    valueProps: string[];
    stats?: Array<{ value: string; label: string }>;
  };
  services: Array<{
    title: string;
    description: string;
    image?: string | null;
  }>;
  gallery?: {
    images: string[];
    title?: string;
  };
  instagram?: {
    handle?: string;
    posts: Array<{
      image: string;
      caption?: string | null;
      link: string;
    }>;
  };
  testimonials?: Array<{
    quote: string;
    author: string;
    role?: string | null;
  }>;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
    instagram?: string | null;
    facebook?: string | null;
  };
  logo: string | null;
  companyName: string;
  tagline?: string;
}

export default function Preview() {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [preview, setPreview] = useState<ClientPreview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPreview();
  }, [slug]);

  const fetchPreview = async () => {
    if (!slug) return;

    const { data, error } = await supabase
      .from('client_previews')
      .select('*')
      .eq('slug', slug)
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

  // Extract colors from brand colors (Firecrawl branding format)
  const colors = brandColors?.colors || brandColors?.branding?.colors || {};
  const primaryColor = colors?.primary || null;
  const secondaryColor = colors?.secondary || null;
  const accentColor = colors?.accent || null;
  const backgroundColor = colors?.background || null;
  const textColor = colors?.textPrimary || null;
  
  // Get logo from schema or branding data
  const logo = schema?.logo || brandColors?.logo || brandColors?.branding?.logo || brandColors?.branding?.images?.logo || null;

  // Create CSS variables for brand colors
  const brandStyles = {
    '--brand-primary': primaryColor || 'hsl(var(--primary))',
    '--brand-secondary': secondaryColor || 'hsl(var(--secondary))',
    '--brand-accent': accentColor || primaryColor || 'hsl(var(--accent))',
    '--brand-background': backgroundColor || 'hsl(var(--background))',
    '--brand-text': textColor || 'hsl(var(--foreground))',
  } as React.CSSProperties;

  console.log('Template:', templateId, 'Brand colors:', { primaryColor, secondaryColor });

  return (
    <div className="min-h-screen bg-background" style={brandStyles}>
      <HeroSection
        companyName={schema?.companyName}
        headline={schema?.hero?.headline || 'Welkom op uw nieuwe website'}
        subheadline={schema?.hero?.subheadline || 'Een professionele online aanwezigheid voor uw bedrijf'}
        ctaText={schema?.hero?.ctaText || 'Aan de slag'}
        logo={logo}
        backgroundImages={schema?.hero?.backgroundImages}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      <AboutSection
        title={schema?.about?.title || 'Over Ons'}
        description={schema?.about?.description || 'Wij bieden uitzonderlijke diensten om uw bedrijf te laten groeien.'}
        valueProps={schema?.about?.valueProps}
        stats={schema?.about?.stats}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      <ServicesSection
        services={schema?.services || []}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      {/* Gallery - template-specific layouts */}
      <GallerySection
        images={schema?.gallery?.images || []}
        title={schema?.gallery?.title || 'Ons Werk'}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      {/* Instagram Feed */}
      <InstagramFeed
        handle={schema?.instagram?.handle}
        posts={schema?.instagram?.posts || []}
        primaryColor={primaryColor}
      />

      {/* Testimonials with horizontal scroll */}
      <TestimonialsSection
        testimonials={schema?.testimonials || []}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      <ContactSection
        email={schema?.contact?.email}
        phone={schema?.contact?.phone}
        address={schema?.contact?.address}
        instagram={schema?.contact?.instagram}
        facebook={schema?.contact?.facebook}
        primaryColor={primaryColor}
        templateId={templateId}
      />

      <FeedbackButton previewId={preview.id} primaryColor={primaryColor} />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-background">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Preview gegenereerd door PreviewPro
          </p>
          {logo && (
            <img 
              src={logo} 
              alt={schema?.companyName || 'Logo'} 
              className="h-8 w-auto object-contain opacity-50"
            />
          )}
        </div>
      </footer>
    </div>
  );
}
