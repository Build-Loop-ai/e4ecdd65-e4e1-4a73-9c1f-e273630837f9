import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.images?.[0]?.image_url?.url || null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function uploadToStorage(supabase: any, base64Data: string, fileName: string): Promise<string | null> {
  try {
    const base64Content = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Content), c => c.charCodeAt(0));
    const contentType = base64Data.startsWith('data:image/png') ? 'image/png' : 'image/jpeg';
    const extension = contentType === 'image/png' ? 'png' : 'jpg';
    const fullPath = `${fileName}.${extension}`;

    const { error } = await supabase.storage
      .from('generated-images')
      .upload(fullPath, binaryData, { contentType, upsert: true });

    if (error) {
      console.error('Storage upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('generated-images')
      .getPublicUrl(fullPath);

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
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "AI or storage not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { previewId, imageType, index } = await req.json();
    // imageType: "hero" | "gallery" | "service"
    // index: number (for gallery) or service name (for service)

    if (!previewId || !imageType) {
      return new Response(JSON.stringify({ error: "previewId and imageType required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch the preview (owned by user)
    const { data: preview, error: pErr } = await userClient
      .from("client_previews")
      .select("*")
      .eq("id", previewId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (pErr || !preview) {
      return new Response(JSON.stringify({ error: "Preview not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const schema = preview.processed_schema as any;
    const branding = preview.brand_colors as any;
    const companyName = schema?.companyName || preview.client_name;
    const businessType = schema?.businessType || "business";
    const city = schema?.contact?.city || schema?.contact?.address || "";
    const primaryColor = branding?.colors?.primary || "#4F46E5";
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    const timestamp = Date.now();

    // Build a rich, location-aware prompt
    const locationContext = city ? ` in ${city}` : "";
    const businessContext = `${companyName}, a ${businessType}${locationContext}`;

    // Gather services/about for content context
    const aboutSnippet = (schema?.about?.description || "").substring(0, 200);
    const serviceNames = (schema?.services || []).map((s: any) => s.title).filter(Boolean).slice(0, 6).join(", ");
    const contentContext = [aboutSnippet, serviceNames ? `Services: ${serviceNames}` : ""].filter(Boolean).join(". ");

    let prompt = "";
    let storagePath = "";

    if (imageType === "hero") {
      prompt = `Create a stunning, ultra-high-quality professional photograph for the hero section of a website for ${businessContext}.
Business context: ${contentContext}
Style: Wide-angle cinematic shot, 16:9 landscape aspect ratio, warm ambient lighting.
${city ? `Incorporate subtle visual cues of ${city} — local architecture, landscape, or atmosphere.` : ""}
Color mood: Incorporate subtle ${primaryColor} accent tones in the lighting or environment.
CRITICAL: Absolutely NO text, NO logos, NO signs, NO words, NO letters visible anywhere.
Magazine editorial quality, photorealistic, ultra high resolution.`;
      storagePath = `${slug}/hero-regen-${timestamp}`;
    } else if (imageType === "gallery") {
      const variations = ['a close-up detail shot', 'a medium lifestyle shot', 'an artistic wide-angle', 'a moody atmospheric shot'];
      const variation = variations[(index || 0) % variations.length];
      prompt = `Create ${variation} for the gallery of ${businessContext}.
Business context: ${contentContext}
${city ? `Setting should feel like ${city} — use local visual references.` : ""}
Professional commercial photography. Clean, modern composition. ${primaryColor} color accents where natural.
NO text, NO watermarks, NO logos. Square format 1:1 aspect ratio.
Ultra high resolution, photorealistic.`;
      storagePath = `${slug}/gallery-regen-${timestamp}-${index || 0}`;
    } else if (imageType === "service") {
      const serviceName = index || "service";
      prompt = `Create a professional photograph representing the "${serviceName}" service offered by ${businessContext}.
${city ? `Setting feels authentic to ${city}.` : ""}
Professional quality, warm lighting, inviting atmosphere. ${primaryColor} accent tones.
NO text, NO labels, NO logos. Square format.
Ultra high resolution, photorealistic.`;
      const safeName = String(serviceName).toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 20);
      storagePath = `${slug}/service-regen-${safeName}-${timestamp}`;
    } else {
      return new Response(JSON.stringify({ error: "Invalid imageType" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const base64 = await generateImage(prompt, LOVABLE_API_KEY);
    if (!base64) {
      return new Response(JSON.stringify({ error: "Image generation failed. Try again." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publicUrl = await uploadToStorage(serviceClient, base64, storagePath);
    if (!publicUrl) {
      return new Response(JSON.stringify({ error: "Failed to save image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, imageUrl: publicUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("regenerate-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
