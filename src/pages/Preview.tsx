import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Loader2, Mail, Phone, MapPin } from 'lucide-react';
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
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleFeedback = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!preview) return;

    setSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('client_feedback').insert({
      preview_id: preview.id,
      client_name: formData.get('name') as string || null,
      client_email: formData.get('email') as string || null,
      feedback_text: formData.get('feedback') as string,
    });

    if (error) {
      toast({
        title: 'Error submitting feedback',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      // Update preview status
      await supabase
        .from('client_previews')
        .update({ status: 'feedback_received' })
        .eq('id', preview.id);

      toast({
        title: 'Feedback submitted!',
        description: 'Thank you for your feedback. We will review it shortly.',
      });
      setFeedbackOpen(false);
    }
    setSubmitting(false);
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
          <h1 className="text-2xl font-bold mb-2">Preview Not Found</h1>
          <p className="text-muted-foreground">This preview link may be invalid or expired.</p>
        </div>
      </div>
    );
  }

  const schema = preview.processed_schema as unknown as ProcessedSchema;
  const brandColors = preview.brand_colors as any;
  const isModern = preview.template_id === 'modern-professional';

  // Extract primary color from brand colors if available
  const primaryColor = brandColors?.colors?.primary || '#1a1a2e';
  const accentColor = brandColors?.colors?.accent || brandColors?.colors?.secondary || '#4a4a6a';

  return (
    <div className="min-h-screen" style={{ '--brand-primary': primaryColor, '--brand-accent': accentColor } as React.CSSProperties}>
      {/* Hero Section */}
      <section 
        className={`py-24 px-4 ${isModern ? 'bg-foreground text-background' : 'bg-gradient-to-br from-primary/10 to-secondary/10'}`}
      >
        <div className="container mx-auto max-w-4xl text-center">
          {schema?.companyName && (
            <p className={`text-sm font-medium uppercase tracking-widest mb-4 ${isModern ? 'text-background/70' : 'text-primary'}`}>
              {schema.companyName}
            </p>
          )}
          <h1 className={`font-bold mb-6 ${isModern ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'}`}>
            {schema?.hero?.headline || 'Welcome to Your New Website'}
          </h1>
          <p className={`text-xl mb-8 max-w-2xl mx-auto ${isModern ? 'text-background/80' : 'text-muted-foreground'}`}>
            {schema?.hero?.subheadline || 'A professional online presence for your business'}
          </p>
          <Button size="lg" className={isModern ? 'bg-background text-foreground hover:bg-background/90' : ''}>
            {schema?.hero?.ctaText || 'Get Started'}
          </Button>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl">
          <h2 className={`font-bold mb-6 text-center ${isModern ? 'text-4xl' : 'text-3xl'}`}>
            {schema?.about?.title || 'About Us'}
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            {schema?.about?.description || 'We provide exceptional services to help your business grow.'}
          </p>
          
          {schema?.about?.valueProps && schema.about.valueProps.length > 0 && (
            <div className="grid md:grid-cols-3 gap-8">
              {schema.about.valueProps.map((prop, index) => (
                <div key={index} className={`text-center p-6 rounded-lg ${isModern ? 'bg-muted' : 'border'}`}>
                  <p className="font-medium">{prop}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Services Section */}
      {schema?.services && schema.services.length > 0 && (
        <section className="py-20 px-4 bg-muted">
          <div className="container mx-auto max-w-4xl">
            <h2 className={`font-bold mb-12 text-center ${isModern ? 'text-4xl' : 'text-3xl'}`}>
              Our Services
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {schema.services.map((service, index) => (
                <div key={index} className="bg-background p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground">{service.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className={`font-bold mb-8 ${isModern ? 'text-4xl' : 'text-3xl'}`}>
            Get In Touch
          </h2>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            {schema?.contact?.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-5 w-5" />
                <span>{schema.contact.email}</span>
              </div>
            )}
            {schema?.contact?.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-5 w-5" />
                <span>{schema.contact.phone}</span>
              </div>
            )}
            {schema?.contact?.address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{schema.contact.address}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feedback Button */}
      <div className="fixed bottom-6 right-6">
        <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="shadow-lg">
              <MessageSquare className="h-5 w-5 mr-2" />
              Request Changes
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Request Changes</DialogTitle>
              <DialogDescription>
                Let us know what changes you'd like to see on your new website
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleFeedback} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name (optional)</Label>
                <Input id="name" name="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" name="email" type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="feedback">What would you like to change?</Label>
                <Textarea
                  id="feedback"
                  name="feedback"
                  placeholder="I'd like to update the hero section text and add more services..."
                  required
                  rows={4}
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Feedback
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t text-center text-sm text-muted-foreground">
        <p>Preview generated by PreviewPro</p>
      </footer>
    </div>
  );
}
