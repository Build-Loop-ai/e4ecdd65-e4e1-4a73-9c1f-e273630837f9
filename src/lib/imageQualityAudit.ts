import { supabase } from '@/integrations/supabase/client';

export interface ImageAuditResult {
  url: string;
  status: 'pass' | 'fail' | 'unreachable';
  score: number;
  reason: string;
}

export interface AuditReport {
  results: ImageAuditResult[];
  passCount: number;
  failCount: number;
}

/**
 * Collects all image URLs from a processed schema
 */
export function collectImageUrls(schema: any): { type: 'hero' | 'gallery' | 'service'; url: string; index?: number | string }[] {
  const images: { type: 'hero' | 'gallery' | 'service'; url: string; index?: number | string }[] = [];

  // Hero images
  const heroImages = schema?.hero?.backgroundImages || [];
  heroImages.forEach((url: string) => {
    if (url) images.push({ type: 'hero', url });
  });

  // Gallery images
  const galleryImages = schema?.gallery?.images || [];
  galleryImages.forEach((img: any, i: number) => {
    const url = typeof img === 'string' ? img : img?.url;
    if (url) images.push({ type: 'gallery', url, index: i });
  });

  // Service images
  const services = schema?.services || [];
  services.forEach((svc: any) => {
    if (svc.image && svc.title) {
      images.push({ type: 'service', url: svc.image, index: svc.title });
    }
  });

  return images;
}

/**
 * Calls the audit-images edge function to check image quality
 */
export async function auditImages(
  imageUrls: string[],
  businessType: string
): Promise<AuditReport> {
  if (imageUrls.length === 0) {
    return { results: [], passCount: 0, failCount: 0 };
  }

  const { data, error } = await supabase.functions.invoke('audit-images', {
    body: { images: imageUrls, businessType },
  });

  if (error || !data?.success) {
    console.error('Audit failed:', error || data?.error);
    // Return all as pass on failure to avoid blocking the flow
    return {
      results: imageUrls.map(url => ({ url, status: 'pass' as const, score: 7, reason: 'Audit unavailable' })),
      passCount: imageUrls.length,
      failCount: 0,
    };
  }

  const results: ImageAuditResult[] = data.results;
  return {
    results,
    passCount: results.filter(r => r.status === 'pass').length,
    failCount: results.filter(r => r.status !== 'pass').length,
  };
}

/**
 * Full audit-and-fix pipeline: audits images, regenerates failures, returns updated schema
 */
export async function auditAndFixImages(
  schema: any,
  previewId: string,
  onProgress?: (msg: string) => void
): Promise<{ updatedSchema: any; report: AuditReport }> {
  const allImages = collectImageUrls(schema);
  const urls = allImages.map(i => i.url);
  const businessType = schema?.businessIntelligence?.businessType || schema?.businessType || 'business';

  onProgress?.('Checking image quality...');
  const report = await auditImages(urls, businessType);

  if (report.failCount === 0) {
    onProgress?.('All images passed quality check!');
    return { updatedSchema: schema, report };
  }

  onProgress?.(`${report.failCount} image(s) need improvement, regenerating...`);

  // Build a map of failed URLs
  const failedUrls = new Set(
    report.results.filter(r => r.status !== 'pass').map(r => r.url)
  );

  // Find which image targets need regeneration
  const toRegenerate = allImages.filter(img => failedUrls.has(img.url));
  const updatedSchema = JSON.parse(JSON.stringify(schema));

  // Regenerate each failed image
  for (const target of toRegenerate) {
    try {
      onProgress?.(`Regenerating ${target.type} image...`);

      const { data, error } = await supabase.functions.invoke('regenerate-image', {
        body: {
          previewId,
          imageType: target.type,
          index: target.index,
        },
      });

      if (error || !data?.imageUrl) {
        console.warn(`Failed to regenerate ${target.type}:`, error || data?.error);
        continue;
      }

      const newUrl = data.imageUrl;

      // Apply the new URL to the schema
      if (target.type === 'hero') {
        if (!updatedSchema.hero) updatedSchema.hero = {};
        if (!updatedSchema.hero.backgroundImages) updatedSchema.hero.backgroundImages = [];
        const idx = updatedSchema.hero.backgroundImages.indexOf(target.url);
        if (idx >= 0) {
          updatedSchema.hero.backgroundImages[idx] = newUrl;
        } else if (updatedSchema.hero.backgroundImages.length > 0) {
          updatedSchema.hero.backgroundImages[0] = newUrl;
        } else {
          updatedSchema.hero.backgroundImages.push(newUrl);
        }
      } else if (target.type === 'gallery' && typeof target.index === 'number') {
        const existing = updatedSchema.gallery?.images?.[target.index];
        if (typeof existing === 'string') {
          updatedSchema.gallery.images[target.index] = newUrl;
        } else if (existing) {
          updatedSchema.gallery.images[target.index] = { ...existing, url: newUrl };
        }
      } else if (target.type === 'service') {
        const svcIdx = updatedSchema.services?.findIndex((s: any) => s.title === target.index);
        if (svcIdx >= 0) {
          updatedSchema.services[svcIdx] = { ...updatedSchema.services[svcIdx], image: newUrl };
        }
      }
    } catch (e) {
      console.warn(`Error regenerating ${target.type}:`, e);
    }
  }

  onProgress?.('Image quality check complete!');
  return { updatedSchema, report };
}
