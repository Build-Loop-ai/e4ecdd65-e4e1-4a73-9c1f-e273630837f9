import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  Pencil,
  Trash2,
  Download,
  LayoutTemplate,
  Eye,
  Palette,
  Type,
  ChevronDown,
  Check,
  Globe,
  Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';
import PitchScoreCard from '@/components/manage/PitchScoreCard';
import ImageRegenerator from '@/components/manage/ImageRegenerator';

type ClientPreview = Tables<'client_previews'>;
type Viewport = 'desktop' | 'tablet' | 'mobile';

interface ManageSidebarProps {
  preview: ClientPreview;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onStatusChange: (status: 'draft' | 'sent' | 'feedback_received') => void;
  onTemplateChange: (templateId: string) => void;
  onOpenFeedback: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onPreviewUpdate?: (updatedPreview: Partial<ClientPreview>) => void;
  feedbackCount: number;
}

const templates = [
  { id: 'corporate-classic', name: 'Corporate Classic', color: 'from-slate-600 to-slate-800' },
  { id: 'modern-professional', name: 'Modern Professional', color: 'from-blue-500 to-purple-600' },
  { id: 'bold-starter', name: 'Bold Starter', color: 'from-rose-500 to-orange-500' },
  { id: 'elegant-minimal', name: 'Elegant Minimal', color: 'from-stone-300 to-stone-400' },
  { id: 'warm-friendly', name: 'Warm Friendly', color: 'from-amber-400 to-orange-400' },
];

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', color: 'bg-primary/10 text-primary' },
  feedback_received: { label: 'Feedback Received', color: 'bg-primary/10 text-primary' },
};

export default function ManageSidebar({
  preview,
  viewport,
  onViewportChange,
  onStatusChange,
  onTemplateChange,
  onOpenFeedback,
  onEdit,
  onDelete,
  onPreviewUpdate,
  feedbackCount,
}: ManageSidebarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const previewUrl = `${window.location.origin}/preview/${preview.slug}`;
  const schema = preview.processed_schema as any;
  const companyName = schema?.companyName || preview.client_name;
  const branding = preview.brand_colors as any;
  const heroImage = schema?.hero?.backgroundImages?.[0];

  const copyLink = () => {
    navigator.clipboard.writeText(previewUrl);
    toast({ title: 'Link copied to clipboard' });
  };

  const openExternal = () => {
    window.open(previewUrl, '_blank');
  };

  const exportCode = () => {
    const brandColorsData = preview.brand_colors as any;
    const exportData = {
      meta: {
        exportedAt: new Date().toISOString(),
        clientName: preview.client_name,
        originalUrl: preview.original_url,
        templateId: preview.template_id,
        previewUrl,
      },
      schema: schema || {},
      brandColors: brandColorsData || {},
    };

    const name = schema?.companyName || preview.client_name;
    const hero = schema?.hero || {};
    const about = schema?.about || {};
    const services = schema?.services || [];
    const contact = schema?.contact || {};
    const testimonials = schema?.testimonials || [];
    const gallery = schema?.gallery || {};
    const pColor = schema?.brandColors?.primary || brandColorsData?.colors?.primary || '#2563eb';

    const svcHtml = services.map((s: any) => `
      <div style="background:#f9fafb;padding:24px;border-radius:12px;">
        <h3 style="margin:0 0 8px;font-size:18px;">${s.title || s.name || ''}</h3>
        <p style="margin:0;color:#6b7280;">${s.description || ''}</p>
      </div>`).join('\n');

    const testHtml = testimonials.map((t: any) => `
      <blockquote style="background:#f9fafb;padding:24px;border-radius:12px;border-left:4px solid ${pColor};margin:0;">
        <p style="margin:0 0 8px;font-style:italic;">"${t.text || t.quote || ''}"</p>
        <cite style="color:#6b7280;">— ${t.author || t.name || 'Client'}</cite>
      </blockquote>`).join('\n');

    const galHtml = (gallery?.images || []).map((img: any) => `
      <img src="${typeof img === 'string' ? img : img?.url || ''}" alt="${typeof img === 'string' ? '' : img?.alt || ''}" style="width:100%;border-radius:12px;object-fit:cover;aspect-ratio:4/3;" />`).join('\n');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} - Website Reference</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1f2937; line-height: 1.6; }
    .hero { background: linear-gradient(135deg, ${pColor}, ${pColor}dd); color: white; padding: 80px 24px; text-align: center; }
    .hero h1 { font-size: 48px; font-weight: 800; margin-bottom: 16px; }
    .hero p { font-size: 20px; opacity: 0.9; max-width: 600px; margin: 0 auto 32px; }
    .hero a { display: inline-block; background: white; color: ${pColor}; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
    section { max-width: 960px; margin: 0 auto; padding: 64px 24px; }
    section h2 { font-size: 32px; font-weight: 700; margin-bottom: 32px; }
    .grid-2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
    .grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
    .contact-item { margin-bottom: 12px; }
    .contact-item strong { display: block; color: ${pColor}; }
    footer { text-align: center; padding: 32px; color: #9ca3af; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="hero">
    <h1>${hero.headline || name}</h1>
    <p>${hero.subheadline || ''}</p>
    ${hero.ctaText ? `<a href="#contact">${hero.ctaText}</a>` : ''}
  </div>
  <section>
    <h2>About</h2>
    <p>${about.description || ''}</p>
  </section>
  ${services.length > 0 ? `<section style="background:#f9fafb;"><div style="max-width:960px;margin:0 auto;"><h2>Services</h2><div class="grid-2">${svcHtml}</div></div></section>` : ''}
  ${(gallery?.images || []).length > 0 ? `<section><h2>Gallery</h2><div class="grid-3">${galHtml}</div></section>` : ''}
  ${testimonials.length > 0 ? `<section><h2>Testimonials</h2><div class="grid-2">${testHtml}</div></section>` : ''}
  <section id="contact">
    <h2>Contact</h2>
    ${contact.email ? `<div class="contact-item"><strong>Email</strong>${contact.email}</div>` : ''}
    ${contact.phone ? `<div class="contact-item"><strong>Phone</strong>${contact.phone}</div>` : ''}
    ${contact.address ? `<div class="contact-item"><strong>Address</strong>${contact.address}</div>` : ''}
  </section>
  <footer>&copy; ${new Date().getFullYear()} ${name}</footer>
</body>
</html>`;

    const slug = preview.slug.replace(/\//g, '-');
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const htmlLink = document.createElement('a');
    htmlLink.href = URL.createObjectURL(htmlBlob);
    htmlLink.download = `${slug}-reference.html`;
    htmlLink.click();

    setTimeout(() => {
      const jsonBlob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const jsonLink = document.createElement('a');
      jsonLink.href = URL.createObjectURL(jsonBlob);
      jsonLink.download = `${slug}-data.json`;
      jsonLink.click();
    }, 500);

    toast({ title: 'Export started', description: 'HTML reference + JSON data downloading...' });
  };

  const currentTemplate = templates.find(t => t.id === preview.template_id) || templates[0];

  return (
    <aside className="w-72 bg-background border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/dashboard/previews')}
          className="w-full justify-start text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Pitches
        </Button>

        {/* Preview Identity Card */}
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          {/* Hero preview */}
          <div 
            className="h-24 bg-gradient-to-br from-primary/10 to-primary/5 relative"
            style={{
              backgroundImage: heroImage ? `url(${heroImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!heroImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Globe className="h-8 w-8 text-primary/20" />
              </div>
            )}
          </div>
          
          <div className="p-3">
            <h2 className="font-semibold text-foreground truncate">{companyName}</h2>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{preview.original_url}</p>
            
            {/* Status badge */}
            <div className="mt-3">
              <Select
                value={preview.status}
                onValueChange={(value: 'draft' | 'sent' | 'feedback_received') => onStatusChange(value)}
              >
              <SelectTrigger className="h-8 text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', 
                      preview.status === 'draft' ? 'bg-muted-foreground' :
                      preview.status === 'sent' ? 'bg-primary' : 'bg-chart-1'
                    )} />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent to Client</SelectItem>
                  <SelectItem value="feedback_received">Feedback Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Actions */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Actions</p>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9"
            onClick={copyLink}
          >
            <Copy className="h-4 w-4 mr-3 text-muted-foreground" />
            Copy Link
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9"
            onClick={openExternal}
          >
            <ExternalLink className="h-4 w-4 mr-3 text-muted-foreground" />
            Open Preview
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9"
            onClick={exportCode}
          >
            <Download className="h-4 w-4 mr-3 text-muted-foreground" />
            Export Code
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start h-9 relative"
            onClick={onOpenFeedback}
          >
            <MessageSquare className="h-4 w-4 mr-3 text-muted-foreground" />
            View Feedback
            {feedbackCount > 0 && (
              <Badge 
                variant="destructive" 
                className="ml-auto h-5 min-w-5 flex items-center justify-center p-0 text-[10px]"
              >
                {feedbackCount}
              </Badge>
            )}
          </Button>
        </div>

        <Separator />

        {/* Viewport */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Device Preview</p>
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-lg">
            {[
              { value: 'desktop' as Viewport, icon: Monitor, label: 'Desktop' },
              { value: 'tablet' as Viewport, icon: Tablet, label: 'Tablet' },
              { value: 'mobile' as Viewport, icon: Smartphone, label: 'Mobile' },
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => onViewportChange(value)}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 rounded-md text-xs transition-all',
                  viewport === value 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px]">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Template Selection */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Template</p>
          <div className="space-y-1">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onTemplateChange(template.id)}
                className={cn(
                  'w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all text-sm',
                  preview.template_id === template.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted border border-transparent'
                )}
              >
                <div className={cn('w-8 h-8 rounded-md bg-gradient-to-br flex-shrink-0', template.color)} />
                <span className={cn(
                  'flex-1 truncate',
                  preview.template_id === template.id ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {template.name}
                </span>
                {preview.template_id === template.id && (
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* AI Score */}
        <PitchScoreCard previewId={preview.id} />

        <Separator />

        {/* Image Regeneration */}
        <ImageRegenerator
          preview={preview}
          onImageRegenerated={(updatedSchema) => {
            onPreviewUpdate?.({ processed_schema: updatedSchema });
          }}
        />

        <Separator />

        {/* Edit Content */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Customize</p>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start h-9"
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4 mr-3" />
            Edit Content & Colors
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Clock className="h-3.5 w-3.5" />
          <span>Created {new Date(preview.created_at).toLocaleDateString()}</span>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-3" />
              Delete Pitch
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this pitch?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the pitch for <strong>{companyName}</strong>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
