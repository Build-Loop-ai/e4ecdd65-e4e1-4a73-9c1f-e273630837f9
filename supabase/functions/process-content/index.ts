const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('process-content started');
    const { scrapedContent, brandColors } = await req.json();
    console.log('Payload received - markdown length:', scrapedContent?.markdown?.length || 0);

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert at analyzing scraped website content and organizing it into a structured schema for a premium, high-end website template.

Your task is to extract and organize ALL available content from the provided website:

1. Hero section: main headline, subheadline, call-to-action text
2. About section: company description, mission statement, key value propositions (extract 3-5 strong points)
3. Services section: list of ALL services with titles and detailed descriptions
4. Contact section: email, phone, address, social links
5. Gallery/Portfolio: extract ALL image URLs found (product images, portfolio, team photos, etc.)
6. Instagram feed: if Instagram posts/images are found, extract their image URLs and captions
7. Testimonials: any customer quotes or reviews with names
8. Statistics: any numbers/stats mentioned (years in business, clients served, etc.)

Return a JSON object with this exact structure:
{
  "hero": {
    "headline": "string - make it impactful and professional",
    "subheadline": "string - compelling value proposition", 
    "ctaText": "string - action-oriented button text",
    "backgroundImages": ["array of image URLs found that could work as hero backgrounds"]
  },
  "about": {
    "title": "string",
    "description": "string - detailed company description",
    "valueProps": ["string", "string", "string"],
    "stats": [
      { "value": "25+", "label": "Years Experience" }
    ]
  },
  "services": [
    { "title": "string", "description": "string", "image": "string url or null" }
  ],
  "gallery": {
    "images": ["array of ALL image URLs found on the site"],
    "title": "string - section title like 'Our Work' or 'Portfolio'"
  },
  "instagram": {
    "handle": "string - instagram username if found",
    "posts": [
      { "image": "string url", "caption": "string or null", "link": "string url" }
    ]
  },
  "testimonials": [
    { "quote": "string", "author": "string", "role": "string or null" }
  ],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null",
    "instagram": "string url or null",
    "facebook": "string url or null"
  },
  "logo": "string url or null",
  "companyName": "string",
  "tagline": "string - short brand tagline if available"
}

IMPORTANT: 
- Extract ALL images you can find, especially from Instagram embeds, galleries, sliders, and portfolio sections
- Look for Instagram feed embeds - these often have multiple post images
- Extract real testimonials if available, otherwise omit the testimonials array
- Make the content feel premium and professional`;

    // Extract logo from branding data
    const logoUrl = brandColors?.logo || brandColors?.images?.logo || scrapedContent?.branding?.logo || scrapedContent?.branding?.images?.logo || null;
    console.log('Logo URL found:', logoUrl);

    // Extract images from HTML if available
    const htmlContent = scrapedContent?.html || '';
    const imageMatches = htmlContent.match(/(?:src|data-src|data-full-res)=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)[^"']*)/gi) || [];
    const extractedImages = imageMatches
      .map((match: string) => {
        const urlMatch = match.match(/["']([^"']+)/);
        return urlMatch ? urlMatch[1] : null;
      })
      .filter((url: string | null): url is string => url !== null && !url.includes('thumb') && !url.includes('icon'))
      .slice(0, 30);

    console.log('Extracted images count:', extractedImages.length);

    const userPrompt = `Here is the scraped website content to analyze:

MARKDOWN CONTENT:
${scrapedContent?.markdown || 'No markdown content available'}

HTML CONTENT (for image extraction):
${htmlContent.slice(0, 15000)}

BRAND COLORS AND BRANDING:
${JSON.stringify(brandColors || scrapedContent?.branding || {}, null, 2)}

EXTRACTED IMAGES FROM HTML:
${JSON.stringify(extractedImages, null, 2)}

LINKS FOUND:
${JSON.stringify(scrapedContent?.links?.slice(0, 30) || [], null, 2)}

METADATA:
${JSON.stringify(scrapedContent?.metadata || {}, null, 2)}

LOGO URL (if found):
${logoUrl || 'No logo found'}

Please analyze this content thoroughly and return the complete structured JSON schema with ALL available content, especially images and Instagram posts if present.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error('AI processing failed');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    
    let processedSchema;
    try {
      processedSchema = JSON.parse(content);
    } catch {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid AI response format');
    }

    // Ensure extracted images are included even if AI missed them
    if (!processedSchema.gallery) {
      processedSchema.gallery = { images: [], title: 'Gallery' };
    }
    if (extractedImages.length > 0 && processedSchema.gallery.images.length === 0) {
      processedSchema.gallery.images = extractedImages;
    }

    return new Response(
      JSON.stringify({ success: true, schema: processedSchema }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
