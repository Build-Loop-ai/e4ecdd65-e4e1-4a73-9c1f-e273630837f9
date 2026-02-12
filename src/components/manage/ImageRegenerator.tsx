import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, RefreshCw, Loader2, Check, ChevronDown, ChevronUp, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { auditAndFixImages, type ImageAuditResult, type AuditReport } from '@/lib/imageQualityAudit';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;

interface ImageRegeneratorProps {
  preview: ClientPreview;
  onImageRegenerated: (updatedSchema: any) => void;
}

type ImageTarget = {
  type: 'hero' | 'gallery' | 'service';
  label: string;
  index?: number | string;
  currentUrl?: string;
};

export default function ImageRegenerator({ preview, onImageRegenerated }: ImageRegeneratorProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [auditReport, setAuditReport] = useState<AuditReport | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);

  const schema = preview.processed_schema as any;
  if (!schema) return null;

  // Build list of image targets
  const targets: ImageTarget[] = [];

  // Hero images
  const heroImages = schema?.hero?.backgroundImages || [];
  targets.push({
    type: 'hero',
    label: 'Hero Background',
    currentUrl: heroImages[0] || undefined,
  });

  // Gallery images
  const galleryImages = schema?.gallery?.images || [];
  galleryImages.forEach((img: any, i: number) => {
    targets.push({
      type: 'gallery',
      label: `Gallery ${i + 1}`,
      index: i,
      currentUrl: typeof img === 'string' ? img : img?.url,
    });
  });
  // Option to add a new gallery image
  targets.push({
    type: 'gallery',
    label: `Gallery ${galleryImages.length + 1} (new)`,
    index: galleryImages.length,
  });

  // Service images
  const services = schema?.services || [];
  services.forEach((svc: any) => {
    if (svc.title) {
      targets.push({
        type: 'service',
        label: svc.title,
        index: svc.title,
        currentUrl: svc.image || undefined,
      });
    }
  });

  const regenerate = async (target: ImageTarget) => {
    const key = `${target.type}-${target.index ?? 'main'}`;
    setRegenerating(key);

    try {
      const { data, error } = await supabase.functions.invoke('regenerate-image', {
        body: {
          previewId: preview.id,
          imageType: target.type,
          index: target.index,
        },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      const newUrl = data.imageUrl;

      // Update the schema with the new image
      const updatedSchema = JSON.parse(JSON.stringify(schema));

      if (target.type === 'hero') {
        if (!updatedSchema.hero) updatedSchema.hero = {};
        if (!updatedSchema.hero.backgroundImages) updatedSchema.hero.backgroundImages = [];
        if (updatedSchema.hero.backgroundImages.length > 0) {
          updatedSchema.hero.backgroundImages[0] = newUrl;
        } else {
          updatedSchema.hero.backgroundImages.push(newUrl);
        }
      } else if (target.type === 'gallery') {
        if (!updatedSchema.gallery) updatedSchema.gallery = { images: [] };
        if (!updatedSchema.gallery.images) updatedSchema.gallery.images = [];
        const idx = typeof target.index === 'number' ? target.index : updatedSchema.gallery.images.length;
        if (idx < updatedSchema.gallery.images.length) {
          // Replace existing — handle both string and object formats
          const existing = updatedSchema.gallery.images[idx];
          if (typeof existing === 'string') {
            updatedSchema.gallery.images[idx] = newUrl;
          } else {
            updatedSchema.gallery.images[idx] = { ...existing, url: newUrl };
          }
        } else {
          updatedSchema.gallery.images.push(newUrl);
        }
      } else if (target.type === 'service') {
        const svcIdx = updatedSchema.services?.findIndex((s: any) => s.title === target.index);
        if (svcIdx >= 0) {
          updatedSchema.services[svcIdx] = {
            ...updatedSchema.services[svcIdx],
            image: newUrl,
          };
        }
      }

      // Save to database
      const { error: updateErr } = await supabase
        .from('client_previews')
        .update({ processed_schema: updatedSchema })
        .eq('id', preview.id);

      if (updateErr) throw new Error(updateErr.message);

      onImageRegenerated(updatedSchema);
      toast({ title: 'Image regenerated!', description: `${target.label} has been updated.` });
    } catch (e: any) {
      toast({
        title: 'Regeneration failed',
        description: e.message || 'Could not regenerate image.',
        variant: 'destructive',
      });
    } finally {
      setRegenerating(null);
    }
  };

  // Get audit status for a URL
  const getAuditStatus = (url?: string): ImageAuditResult | undefined => {
    if (!url || !auditReport) return undefined;
    return auditReport.results.find(r => r.url === url);
  };

  const runAudit = async () => {
    setIsAuditing(true);
    try {
      const { updatedSchema, report } = await auditAndFixImages(schema, preview.id);
      setAuditReport(report);

      if (report.failCount > 0) {
        await supabase
          .from('client_previews')
          .update({ processed_schema: updatedSchema })
          .eq('id', preview.id);

        onImageRegenerated(updatedSchema);
        toast({
          title: 'Quality check complete',
          description: `Fixed ${report.failCount} low-quality image(s). ${report.passCount} passed.`,
        });
      } else {
        toast({
          title: 'All images look great!',
          description: `${report.passCount} image(s) passed the quality check.`,
        });
      }
    } catch (e: any) {
      toast({
        title: 'Quality check failed',
        description: e.message || 'Could not audit images.',
        variant: 'destructive',
      });
    } finally {
      setIsAuditing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          AI Image Regeneration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Regenerate images based on business type, location & content.
        </p>

        {/* Quality Check Button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2"
          onClick={runAudit}
          disabled={isAuditing || !!regenerating}
        >
          {isAuditing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          {isAuditing ? 'Checking Quality...' : 'Check Image Quality'}
        </Button>

        {/* Audit Summary */}
        {auditReport && (
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary" className="gap-1">
              <Check className="h-3 w-3 text-green-500" />
              {auditReport.passCount} passed
            </Badge>
            {auditReport.failCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <X className="h-3 w-3" />
                {auditReport.failCount} fixed
              </Badge>
            )}
          </div>
        )}

        {/* Hero — always visible */}
        <RegenerateRow
          target={targets[0]}
          isRegenerating={regenerating === `${targets[0].type}-main`}
          onRegenerate={() => regenerate(targets[0])}
          auditResult={getAuditStatus(targets[0].currentUrl)}
        />

        {/* Expand for more */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : `${targets.length - 1} more images`}
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {expanded && (
          <div className="space-y-2">
            {targets.slice(1).map((target) => {
              const key = `${target.type}-${target.index ?? 'main'}`;
              return (
                <RegenerateRow
                  key={key}
                  target={target}
                  isRegenerating={regenerating === key}
                  onRegenerate={() => regenerate(target)}
                  auditResult={getAuditStatus(target.currentUrl)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegenerateRow({
  target,
  isRegenerating,
  onRegenerate,
  auditResult,
}: {
  target: ImageTarget;
  isRegenerating: boolean;
  onRegenerate: () => void;
  auditResult?: ImageAuditResult;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card">
      {/* Thumbnail */}
      <div className="h-10 w-10 rounded-md bg-muted flex-shrink-0 overflow-hidden relative">
        {target.currentUrl ? (
          <img
            src={target.currentUrl}
            alt={target.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
        {auditResult && (
          <div className="absolute -top-1 -right-1">
            {auditResult.status === 'pass' ? (
              <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            ) : (
              <div className="w-4 h-4 rounded-full bg-destructive flex items-center justify-center" title={auditResult.reason}>
                <AlertTriangle className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">{target.label}</p>
        <p className="text-[10px] text-muted-foreground capitalize">
          {target.type}
          {auditResult && auditResult.status !== 'pass' && (
            <span className="text-destructive ml-1">· {auditResult.reason}</span>
          )}
        </p>
      </div>

      {/* Action */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 flex-shrink-0"
        onClick={onRegenerate}
        disabled={isRegenerating}
        title={`Regenerate ${target.label}`}
      >
        {isRegenerating ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <RefreshCw className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
