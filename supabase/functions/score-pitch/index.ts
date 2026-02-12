import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { previewId } = await req.json();
    if (!previewId) {
      return new Response(JSON.stringify({ error: "previewId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the preview
    const { data: preview, error: previewError } = await supabase
      .from("client_previews")
      .select("*")
      .eq("id", previewId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (previewError || !preview) {
      return new Response(JSON.stringify({ error: "Preview not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schema = preview.processed_schema as any;
    const brandColors = preview.brand_colors as any;

    // Build the analysis prompt
    const pitchSummary = JSON.stringify({
      clientName: preview.client_name,
      url: preview.original_url,
      template: preview.template_id,
      hasHeroHeadline: !!schema?.hero?.headline,
      heroHeadline: schema?.hero?.headline || null,
      hasHeroSubheadline: !!schema?.hero?.subheadline,
      hasBackgroundImages: (schema?.hero?.backgroundImages?.length || 0) > 0,
      backgroundImageCount: schema?.hero?.backgroundImages?.length || 0,
      hasLogo: !!(brandColors?.logo || brandColors?.images?.logo || schema?.logo),
      hasAbout: !!schema?.about?.description,
      aboutLength: (schema?.about?.description || "").length,
      serviceCount: schema?.services?.length || 0,
      services: (schema?.services || []).slice(0, 5).map((s: any) => s.title),
      galleryImageCount: schema?.gallery?.images?.length || 0,
      hasTestimonials: (schema?.testimonials?.length || 0) > 0,
      testimonialCount: schema?.testimonials?.length || 0,
      hasContact: !!(schema?.contact?.email || schema?.contact?.phone || schema?.contact?.address),
      contactFields: Object.keys(schema?.contact || {}),
      hasBrandColors: !!(brandColors?.colors?.primary),
      hasInstagram: !!schema?.instagram?.posts?.length,
      businessType: schema?.businessType || null,
      sectionOrder: schema?.sectionOrder || [],
    }, null, 2);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResponse = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content: `You are a pitch quality analyst for a web design agency sales tool called "Pitch". 
You evaluate generated client pitch websites on how persuasive and complete they are.

Score each dimension 0-100 and provide 1-2 specific, actionable tips per dimension.

Dimensions:
1. **Completeness** — Does the pitch have all key sections filled? (hero, about, services, gallery, contact, testimonials)
2. **Personalization** — Is the content specific to this business, not generic? (business name, industry-specific language, real services)
3. **Visual Appeal** — Does it have strong visuals? (hero images, gallery, logo, brand colors extracted)
4. **Persuasion** — Will this pitch convince a prospect? (compelling headline, clear value prop, social proof, CTA)
5. **Content Depth** — Is there enough substance? (about section length, number of services, testimonials)

Also provide an overall score (weighted average, persuasion and personalization weighted higher) and a single headline summary.`,
            },
            {
              role: "user",
              content: `Score this pitch:\n${pitchSummary}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "return_pitch_score",
                description: "Return structured pitch score analysis",
                parameters: {
                  type: "object",
                  properties: {
                    overall_score: { type: "number", description: "0-100 overall score" },
                    summary: { type: "string", description: "One-line headline summary, max 10 words" },
                    dimensions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string" },
                          score: { type: "number" },
                          tips: {
                            type: "array",
                            items: { type: "string" },
                          },
                        },
                        required: ["name", "score", "tips"],
                        additionalProperties: false,
                      },
                    },
                    top_improvement: {
                      type: "string",
                      description: "The single most impactful thing to improve, max 20 words",
                    },
                  },
                  required: ["overall_score", "summary", "dimensions", "top_improvement"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "return_pitch_score" } },
        }),
      }
    );

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI error:", status, errText);
      return new Response(JSON.stringify({ error: "AI scoring failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI returned no score" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scoreData = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(scoreData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("score-pitch error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
