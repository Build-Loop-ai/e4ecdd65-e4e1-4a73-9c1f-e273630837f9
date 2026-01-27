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

    const systemPrompt = `You are an expert at analyzing scraped website content and organizing it into a structured schema for a professional website template.

Your task is to extract and organize the following sections from the provided content:
1. Hero section: main headline, subheadline, call-to-action text
2. About section: company description, mission statement, key value propositions
3. Services section: list of services with titles and descriptions
4. Contact section: email, phone, address, social links
5. Testimonials: any customer quotes or reviews
6. Team: team member names and roles if available

Return a JSON object with this exact structure:
{
  "hero": {
    "headline": "string",
    "subheadline": "string", 
    "ctaText": "string"
  },
  "about": {
    "title": "string",
    "description": "string",
    "valueProps": ["string", "string", "string"]
  },
  "services": [
    { "title": "string", "description": "string" }
  ],
  "contact": {
    "email": "string or null",
    "phone": "string or null",
    "address": "string or null"
  },
  "logo": "string url or null",
  "companyName": "string"
}

If information is missing, make reasonable professional placeholders that fit the business type.`;

    const userPrompt = `Here is the scraped website content to analyze:

MARKDOWN CONTENT:
${scrapedContent?.markdown || 'No markdown content available'}

BRAND COLORS:
${JSON.stringify(brandColors || {}, null, 2)}

LINKS FOUND:
${JSON.stringify(scrapedContent?.links?.slice(0, 20) || [], null, 2)}

METADATA:
${JSON.stringify(scrapedContent?.metadata || {}, null, 2)}

Please analyze this content and return the structured JSON schema.`;

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
