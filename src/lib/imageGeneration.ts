import { supabase } from '@/integrations/supabase/client';

export interface MissingImages {
  hero: boolean;
  gallery: number;
  services: string[];
}

export interface GeneratedImages {
  hero?: string;
  gallery: string[];
  services: Record<string, string>;
}

export interface ImageGenerationRequest {
  businessType: string;
  industry: string;
  companyName: string;
  primaryColor: string;
  missingImages: MissingImages;
}

export interface ImageGenerationResponse {
  success: boolean;
  error?: string;
  generatedImages?: GeneratedImages;
}

/**
 * Analyzes the processed schema to detect missing images
 */
export function detectImageGaps(processedSchema: any): MissingImages {
  const heroImages = processedSchema?.heroImages || [];
  const galleryImages = processedSchema?.galleryImages || [];
  const services = processedSchema?.services || [];
  
  // Check hero - need at least one text-free hero image
  const hasHeroImage = heroImages.length > 0;
  
  // Check gallery - need at least 3 images
  const galleryNeeded = Math.max(0, 3 - galleryImages.length);
  
  // Check services - find ones without images
  const servicesWithoutImages = services
    .filter((s: any) => !s.image)
    .map((s: any) => s.title)
    .filter(Boolean)
    .slice(0, 4); // Limit to 4 services
  
  return {
    hero: !hasHeroImage,
    gallery: galleryNeeded,
    services: servicesWithoutImages
  };
}

/**
 * Check if any images need to be generated
 */
export function needsImageGeneration(missingImages: MissingImages): boolean {
  return missingImages.hero || missingImages.gallery > 0 || missingImages.services.length > 0;
}

/**
 * Calls the generate-images edge function to create AI-generated images
 */
export async function generateImages(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  try {
    console.log('Calling generate-images with:', {
      businessType: request.businessType,
      industry: request.industry,
      companyName: request.companyName,
      missingImages: request.missingImages
    });

    const { data, error } = await supabase.functions.invoke('generate-images', {
      body: request
    });

    if (error) {
      console.error('Generate images error:', error);
      return { success: false, error: error.message };
    }

    if (!data?.success) {
      return { success: false, error: data?.error || 'Image generation failed' };
    }

    return {
      success: true,
      generatedImages: data.generatedImages
    };
  } catch (error) {
    console.error('Error calling generate-images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Merges generated images into the processed schema
 */
export function mergeGeneratedImages(
  processedSchema: any,
  generatedImages: GeneratedImages
): any {
  const merged = { ...processedSchema };

  // Add hero image if generated
  if (generatedImages.hero) {
    merged.heroImages = [
      {
        url: generatedImages.hero,
        type: 'hero',
        confidence: 0.95,
        hasText: false,
        isGenerated: true
      },
      ...(merged.heroImages || [])
    ];
  }

  // Add gallery images if generated
  if (generatedImages.gallery?.length > 0) {
    const existingGallery = merged.galleryImages || [];
    const newGalleryImages = generatedImages.gallery.map(url => ({
      url,
      type: 'gallery',
      confidence: 0.9,
      hasText: false,
      isGenerated: true
    }));
    merged.galleryImages = [...existingGallery, ...newGalleryImages];
  }

  // Update services with generated images
  if (generatedImages.services && Object.keys(generatedImages.services).length > 0) {
    merged.services = (merged.services || []).map((service: any) => {
      if (!service.image && generatedImages.services[service.title]) {
        return {
          ...service,
          image: generatedImages.services[service.title],
          isGenerated: true
        };
      }
      return service;
    });
  }

  return merged;
}
