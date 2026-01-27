import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { HeroSection } from '@/components/preview/HeroSection';
import { AboutSection } from '@/components/preview/AboutSection';
import { ServicesSection } from '@/components/preview/ServicesSection';
import { ContactSection } from '@/components/preview/ContactSection';
import { FeedbackButton } from '@/components/preview/FeedbackButton';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

interface ProcessedSchema {
  hero: {
    headline: string;
    subheadline: string;
    ctaText: string;
  };
  about: {
    title: string;
    description: string;
    valueProps: string[];
  };
  services: Array<{
    title: string;
    description: string;
  }>;
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  logo: string | null;
  companyName: string;
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
      <div className="min-h-screen bg-background">
        <div className="h-[60vh] flex items-center justify-center">
          <Skeleton className="h-64 w-full max-w-2xl" />
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Preview niet gevonden</h1>
          <p className="text-muted-foreground">Deze preview link is mogelijk ongeldig of verlopen.</p>
        </div>
      </div>
    );
  }

  const schema = preview.processed_schema as unknown as ProcessedSchema;
  const brandColors = preview.brand_colors as any;
  const isModern = preview.template_id === 'modern-professional';

  // Extract primary color from brand colors
  const primaryColor = brandColors?.colors?.primary || brandColors?.branding?.colors?.primary || null;
  
  // Get logo from schema or branding data
  const logo = schema?.logo || brandColors?.logo || brandColors?.branding?.logo || brandColors?.branding?.images?.logo || null;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection
        companyName={schema?.companyName}
        headline={schema?.hero?.headline || 'Welkom op uw nieuwe website'}
        subheadline={schema?.hero?.subheadline || 'Een professionele online aanwezigheid voor uw bedrijf'}
        ctaText={schema?.hero?.ctaText || 'Aan de slag'}
        logo={logo}
        isModern={isModern}
        primaryColor={primaryColor}
      />

      <AboutSection
        title={schema?.about?.title || 'Over Ons'}
        description={schema?.about?.description || 'Wij bieden uitzonderlijke diensten om uw bedrijf te laten groeien.'}
        valueProps={schema?.about?.valueProps}
        isModern={isModern}
        primaryColor={primaryColor}
      />

      <ServicesSection
        services={schema?.services || []}
        isModern={isModern}
        primaryColor={primaryColor}
      />

      <ContactSection
        email={schema?.contact?.email}
        phone={schema?.contact?.phone}
        address={schema?.contact?.address}
        isModern={isModern}
        primaryColor={primaryColor}
      />

      <FeedbackButton previewId={preview.id} primaryColor={primaryColor} />

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground bg-muted/30">
        <p>Preview gegenereerd door PreviewPro</p>
      </footer>
    </div>
  );
}
