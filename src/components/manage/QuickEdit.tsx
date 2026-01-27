import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Type, LayoutTemplate } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

interface QuickEditProps {
  preview: ClientPreview;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ClientPreview>) => void;
}

export default function QuickEdit({ preview, isOpen, onClose, onSave }: QuickEditProps) {
  const schema = preview.processed_schema as any || {};
  const branding = preview.brand_colors as any || {};

  // Content state
  const [headline, setHeadline] = useState('');
  const [subheadline, setSubheadline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [aboutTitle, setAboutTitle] = useState('');
  const [aboutDescription, setAboutDescription] = useState('');

  // Color state
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1e293b');
  const [accentColor, setAccentColor] = useState('#f59e0b');

  // Template state
  const [templateId, setTemplateId] = useState(preview.template_id);

  // Initialize from preview data
  useEffect(() => {
    if (isOpen) {
      setHeadline(schema?.hero?.headline || '');
      setSubheadline(schema?.hero?.subheadline || '');
      setCtaText(schema?.hero?.ctaText || 'Get Started');
      setAboutTitle(schema?.about?.title || '');
      setAboutDescription(schema?.about?.description || '');

      setPrimaryColor(branding?.colors?.primary || '#3b82f6');
      setSecondaryColor(branding?.colors?.secondary || '#1e293b');
      setAccentColor(branding?.colors?.accent || '#f59e0b');

      setTemplateId(preview.template_id);
    }
  }, [isOpen, preview]);

  const handleSave = () => {
    // Build updated schema
    const updatedSchema = {
      ...schema,
      hero: {
        ...schema?.hero,
        headline,
        subheadline,
        ctaText,
      },
      about: {
        ...schema?.about,
        title: aboutTitle,
        description: aboutDescription,
      },
    };

    // Build updated colors
    const updatedBranding = {
      ...branding,
      colors: {
        ...branding?.colors,
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
    };

    onSave({
      processed_schema: updatedSchema,
      brand_colors: updatedBranding,
      template_id: templateId,
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Preview</DialogTitle>
          <DialogDescription>
            Customize the content and styling of your client preview
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Type className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="template" className="flex items-center gap-2">
              <LayoutTemplate className="h-4 w-4" />
              Template
            </TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="headline">Hero Headline</Label>
              <Input
                id="headline"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Main headline..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subheadline">Hero Subheadline</Label>
              <Textarea
                id="subheadline"
                value={subheadline}
                onChange={(e) => setSubheadline(e.target.value)}
                placeholder="Supporting text..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta">CTA Button Text</Label>
              <Input
                id="cta"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Get Started"
              />
            </div>

            <div className="h-px bg-border my-4" />

            <div className="space-y-2">
              <Label htmlFor="aboutTitle">About Section Title</Label>
              <Input
                id="aboutTitle"
                value={aboutTitle}
                onChange={(e) => setAboutTitle(e.target.value)}
                placeholder="About Us"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aboutDescription">About Description</Label>
              <Textarea
                id="aboutDescription"
                value={aboutDescription}
                onChange={(e) => setAboutDescription(e.target.value)}
                placeholder="About your company..."
                rows={4}
              />
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4 mt-4">
            <div className="grid gap-4">
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="accentColor"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-10 w-16 rounded cursor-pointer border border-input"
                    />
                    <Input
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="p-4 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-3">Preview</p>
              <div className="flex gap-2">
                <div
                  className="h-12 flex-1 rounded flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  Primary
                </div>
                <div
                  className="h-12 flex-1 rounded flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: secondaryColor }}
                >
                  Secondary
                </div>
                <div
                  className="h-12 flex-1 rounded flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: accentColor }}
                >
                  Accent
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Template Tab */}
          <TabsContent value="template" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTemplateId('corporate-classic')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  templateId === 'corporate-classic'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-20 rounded bg-gradient-to-br from-slate-700 to-slate-900 mb-3" />
                <h4 className="font-semibold">Corporate Classic</h4>
                <p className="text-xs text-muted-foreground">
                  Traditional, professional styling
                </p>
              </button>

              <button
                onClick={() => setTemplateId('modern-professional')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  templateId === 'modern-professional'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-20 rounded bg-gradient-to-br from-blue-500 to-purple-600 mb-3" />
                <h4 className="font-semibold">Modern Professional</h4>
                <p className="text-xs text-muted-foreground">
                  Contemporary with gradient accents
                </p>
              </button>

              <button
                onClick={() => setTemplateId('bold-starter')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  templateId === 'bold-starter'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-20 rounded bg-black relative overflow-hidden mb-3">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/50 to-purple-500/50" />
                  <div className="absolute top-2 left-2 w-8 h-8 bg-white/10 rounded-lg backdrop-blur" />
                </div>
                <h4 className="font-semibold">Bold Starter</h4>
                <p className="text-xs text-muted-foreground">
                  Vibrant gradients for startups
                </p>
              </button>

              <button
                onClick={() => setTemplateId('elegant-minimal')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  templateId === 'elegant-minimal'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-20 rounded bg-stone-50 border border-stone-200 flex items-center justify-center mb-3">
                  <div className="w-16 h-px bg-stone-300" />
                </div>
                <h4 className="font-semibold">Elegant Minimal</h4>
                <p className="text-xs text-muted-foreground">
                  Refined luxury with whitespace
                </p>
              </button>

              <button
                onClick={() => setTemplateId('warm-friendly')}
                className={`p-4 rounded-lg border-2 text-left transition-all col-span-2 ${
                  templateId === 'warm-friendly'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="h-20 rounded bg-gradient-to-br from-orange-50 to-rose-50 flex items-center justify-center mb-3">
                  <div className="w-12 h-12 bg-orange-400 rounded-2xl" />
                </div>
                <h4 className="font-semibold">Warm Friendly</h4>
                <p className="text-xs text-muted-foreground">
                  Approachable design for local businesses
                </p>
              </button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
