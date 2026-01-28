import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Industry-specific prompt templates
const industryPrompts: Record<string, { hero: string; gallery: string }> = {
  barber: {
    hero: "Modern barbershop interior, warm lighting, vintage leather barber chairs, brass fixtures, exposed brick walls, masculine atmosphere",
    gallery: "Stylish men's haircut showcase, professional barbering, clean fade, well-groomed beard"
  },
  kapper: {
    hero: "Modern barbershop interior, warm lighting, vintage leather barber chairs, brass fixtures, exposed brick walls, masculine atmosphere",
    gallery: "Stylish men's haircut showcase, professional barbering, clean fade, well-groomed beard"
  },
  hairdresser: {
    hero: "Elegant hair salon interior, modern styling stations, large mirrors, professional lighting, chic decor",
    gallery: "Beautiful hairstyle result, professional hair coloring, sleek blowout, salon quality"
  },
  restaurant: {
    hero: "Elegant restaurant interior, ambient candlelight, beautifully set tables with white linens, sophisticated dining atmosphere",
    gallery: "Gourmet dish presentation, professional food photography, artistic plating, appetizing cuisine"
  },
  cafe: {
    hero: "Cozy cafe interior, exposed brick, warm wooden furniture, artisan coffee equipment, natural light through large windows",
    gallery: "Artisan coffee with latte art, fresh pastries, cafe ambiance"
  },
  bakery: {
    hero: "Charming bakery interior, display cases with fresh breads and pastries, warm rustic atmosphere, wooden shelves",
    gallery: "Fresh artisan bread, golden croissants, decorated cakes, bakery delights"
  },
  dentist: {
    hero: "Modern dental clinic, clean white interior, state-of-the-art equipment, professional medical environment, calming atmosphere",
    gallery: "Healthy bright smile, dental care concept, clean teeth, professional dental treatment"
  },
  doctor: {
    hero: "Professional medical office, clean modern interior, comfortable waiting area, calming healthcare environment",
    gallery: "Healthcare concept, medical consultation, professional care, wellness"
  },
  lawyer: {
    hero: "Distinguished law office, rich wood paneling, leather furniture, legal books on shelves, sophisticated professional setting",
    gallery: "Scales of justice, legal documents, professional legal setting, courtroom elements"
  },
  accountant: {
    hero: "Professional accounting office, modern corporate interior, organized workspace, financial charts",
    gallery: "Financial analysis, professional documents, business meeting, corporate setting"
  },
  florist: {
    hero: "Beautiful flower shop interior, colorful floral arrangements everywhere, natural light, botanical atmosphere",
    gallery: "Stunning floral arrangement, vibrant bouquet, wedding flowers, botanical beauty"
  },
  gym: {
    hero: "Modern fitness center, professional gym equipment, motivating atmosphere, clean workout space",
    gallery: "Fitness training, workout equipment, healthy lifestyle, exercise motivation"
  },
  spa: {
    hero: "Luxurious spa interior, zen atmosphere, soft lighting, relaxation room, wellness retreat",
    gallery: "Spa treatment, relaxation therapy, wellness products, tranquil setting"
  },
  yoga: {
    hero: "Serene yoga studio, natural light, wooden floors, minimalist decor, peaceful atmosphere",
    gallery: "Yoga practice, meditation space, wellness lifestyle, peaceful exercise"
  },
  hotel: {
    hero: "Elegant hotel lobby, luxurious interior design, grand entrance, hospitality excellence",
    gallery: "Luxury hotel room, comfortable bedding, premium amenities, hospitality"
  },
  real_estate: {
    hero: "Modern real estate office, professional interior, property listings display, welcoming atmosphere",
    gallery: "Beautiful home interior, modern architecture, dream house, property showcase"
  },
  auto: {
    hero: "Professional auto shop, clean garage interior, modern automotive equipment, car service center",
    gallery: "Car maintenance, automotive repair, clean vehicle, professional service"
  },
  construction: {
    hero: "Professional construction site, modern building project, architectural progress, safety equipment",
    gallery: "Construction work, building materials, architectural design, project development"
  },
  tech: {
    hero: "Modern tech office, open workspace, computers and screens, innovative startup atmosphere",
    gallery: "Technology concept, digital innovation, modern devices, tech workspace"
  },
  photography: {
    hero: "Professional photography studio, lighting equipment, backdrop setup, creative workspace",
    gallery: "Professional photo shoot, studio lighting, creative photography, artistic capture"
  },
  wedding: {
    hero: "Elegant wedding venue, romantic decor, beautiful ceremony setup, celebration atmosphere",
    gallery: "Wedding celebration, romantic flowers, elegant decor, happy couple concept"
  },
  pet: {
    hero: "Friendly pet store or grooming salon, colorful pet supplies, welcoming atmosphere for animals",
    gallery: "Happy pets, pet grooming, animal care, pet products"
  },
  default: {
    hero: "Professional business interior, modern office space, clean design, welcoming corporate atmosphere",
    gallery: "Professional service, business concept, quality work, customer satisfaction"
  }
};

function getIndustryPrompt(businessType: string, industry: string): { hero: string; gallery: string } {
  const type = businessType?.toLowerCase() || '';
  const ind = industry?.toLowerCase() || '';
  
  // Try exact match first
  if (industryPrompts[type]) return industryPrompts[type];
  
  // Try industry category
  if (ind.includes('beauty') || ind.includes('wellness')) {
    return industryPrompts.spa;
  }
  if (ind.includes('food') || ind.includes('restaurant') || ind.includes('hospitality')) {
    return industryPrompts.restaurant;
  }
  if (ind.includes('health') || ind.includes('medical')) {
    return industryPrompts.doctor;
  }
  if (ind.includes('legal') || ind.includes('professional')) {
    return industryPrompts.lawyer;
  }
  if (ind.includes('retail') || ind.includes('shop')) {
    return industryPrompts.florist;
  }
  if (ind.includes('tech') || ind.includes('digital')) {
    return industryPrompts.tech;
  }
  
  return industryPrompts.default;
}

function buildHeroPrompt(basePrompt: string, primaryColor: string): string {
  return `Professional photograph: ${basePrompt}. 
High-end commercial photography style.
Warm ambient lighting with subtle ${primaryColor} accent tones visible in decor or lighting.
Ultra wide angle lens, 4K quality, sharp focus.
CRITICAL: Absolutely NO text, NO logos, NO signs, NO words, NO letters visible anywhere in the image.
Photorealistic, magazine editorial quality.
16:9 aspect ratio, landscape orientation.`;
}

function buildGalleryPrompt(basePrompt: string, primaryColor: string, index: number): string {
  const variations = ['close-up detail shot', 'medium shot', 'artistic angle', 'lifestyle context'];
  const variation = variations[index % variations.length];
  
  return `Professional ${variation}: ${basePrompt}.
Commercial photography style, studio quality lighting.
Subtle ${primaryColor} color accents where appropriate.
Photorealistic, clean composition.
NO text, NO watermarks, NO logos.
Square format, 1:1 aspect ratio.`;
}

async function generateImage(prompt: string, apiKey: string): Promise<string | null> {
  try {
    console.log('Generating image with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        modalities: ["image", "text"]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data).substring(0, 200));
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function uploadToStorage(
  supabase: any,
  base64Data: string,
  fileName: string
): Promise<string | null> {
  try {
    // Extract base64 content (remove data:image/...;base64, prefix)
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    
    // Determine content type
    const contentType = base64Data.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const extension = contentType === 'image/png' ? 'png' : 'jpg';
    const fullPath = `${fileName}.${extension}`;

    const { data, error } = await supabase.storage
      .from('generated-images')
      .upload(fullPath, binaryData, {
        contentType,
        upsert: true
      });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fullPath);

    console.log('Uploaded image to:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading to storage:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Storage service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { businessType, industry, companyName, primaryColor, missingImages } = await req.json();

    console.log('Generate images request:', { businessType, industry, companyName, primaryColor, missingImages });

    const prompts = getIndustryPrompt(businessType, industry);
    const color = primaryColor || '#4F46E5';
    const timestamp = Date.now();
    const slug = companyName?.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30) || 'business';

    const generatedImages: {
      hero?: string;
      gallery: string[];
      services: Record<string, string>;
    } = {
      gallery: [],
      services: {}
    };

    // Generate hero image if needed
    if (missingImages?.hero) {
      console.log('Generating hero image...');
      const heroPrompt = buildHeroPrompt(prompts.hero, color);
      const heroBase64 = await generateImage(heroPrompt, LOVABLE_API_KEY);
      
      if (heroBase64) {
        const heroUrl = await uploadToStorage(supabase, heroBase64, `${slug}/hero-${timestamp}`);
        if (heroUrl) {
          generatedImages.hero = heroUrl;
        }
      }
    }

    // Generate gallery images if needed
    const galleryCount = typeof missingImages?.gallery === 'number' ? missingImages.gallery : 0;
    if (galleryCount > 0) {
      console.log(`Generating ${galleryCount} gallery images...`);
      
      // Generate up to 4 gallery images
      const toGenerate = Math.min(galleryCount, 4);
      
      for (let i = 0; i < toGenerate; i++) {
        const galleryPrompt = buildGalleryPrompt(prompts.gallery, color, i);
        const galleryBase64 = await generateImage(galleryPrompt, LOVABLE_API_KEY);
        
        if (galleryBase64) {
          const galleryUrl = await uploadToStorage(supabase, galleryBase64, `${slug}/gallery-${timestamp}-${i}`);
          if (galleryUrl) {
            generatedImages.gallery.push(galleryUrl);
          }
        }
      }
    }

    // Generate service images if needed
    const serviceNames = missingImages?.services;
    if (Array.isArray(serviceNames) && serviceNames.length > 0) {
      console.log(`Generating ${serviceNames.length} service images...`);
      
      // Limit to 4 service images
      const servicesToGenerate = serviceNames.slice(0, 4);
      
      for (const serviceName of servicesToGenerate) {
        const servicePrompt = `Minimalist professional icon or photograph representing "${serviceName}" service.
${prompts.gallery}.
Simple, elegant, modern design with ${color} color accents.
Clean background, professional quality.
NO text, NO labels, NO words.
Square format.`;
        
        const serviceBase64 = await generateImage(servicePrompt, LOVABLE_API_KEY);
        
        if (serviceBase64) {
          const safeServiceName = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
          const serviceUrl = await uploadToStorage(supabase, serviceBase64, `${slug}/service-${safeServiceName}-${timestamp}`);
          if (serviceUrl) {
            generatedImages.services[serviceName] = serviceUrl;
          }
        }
      }
    }

    console.log('Generated images result:', {
      hasHero: !!generatedImages.hero,
      galleryCount: generatedImages.gallery.length,
      servicesCount: Object.keys(generatedImages.services).length
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        generatedImages 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-images:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
