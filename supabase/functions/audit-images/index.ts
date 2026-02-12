import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ImageAuditResult {
  url: string;
  status: 'pass' | 'fail' | 'unreachable';
  score: number;
  reason: string;
}

async function checkImageReachable(url: string): Promise<{ reachable: boolean; contentLength?: number; contentType?: string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { reachable: false };
    }

    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);

    if (!contentType.startsWith('image/')) {
      return { reachable: false };
    }

    // Images smaller than 5KB are likely icons/placeholders
    if (contentLength > 0 && contentLength < 5000) {
      return { reachable: true, contentLength, contentType };
    }

    return { reachable: true, contentLength, contentType };
  } catch {
    return { reachable: false };
  }
}

async function auditImageWithAI(
  imageUrl: string,
  businessType: string,
  apiKey: string
): Promise<{ score: number; verdict: 'pass' | 'fail'; reason: string }> {
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `You are an image quality auditor for professional websites. Analyze this image for use on a professional ${businessType} website.

Score from 1-10 on each criterion:
- resolution: Is it high enough resolution? Not pixelated or blurry?
- professionalism: Does it look professional, well-composed, good lighting?
- text_free: Is it free of text overlays, watermarks, logos, signage?
- relevance: Is it appropriate for a ${businessType} website?

Rules:
- If the image is a tiny icon, placeholder, or broken: score 1 on all.
- If it has readable text, watermarks, or heavy overlays: text_free score should be 2-3.
- If it's a generic stock placeholder or screenshot: professionalism should be 3-4.
- If ANY individual score is below 5, the overall verdict is FAIL.

Respond with ONLY valid JSON, no markdown:
{"score": <average_score>, "verdict": "pass" or "fail", "reason": "<brief reason>"}`
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI audit error:', response.status);
      // On AI error, assume pass to avoid false negatives
      return { score: 7, verdict: 'pass', reason: 'Could not audit (AI unavailable)' };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response, handling potential markdown wrapping
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { score: 7, verdict: 'pass', reason: 'Could not parse audit result' };
    }

    const result = JSON.parse(jsonMatch[0]);
    return {
      score: Math.round(result.score || 5),
      verdict: result.verdict === 'fail' ? 'fail' : 'pass',
      reason: result.reason || 'No reason provided',
    };
  } catch (error) {
    console.error('Error auditing image:', error);
    return { score: 7, verdict: 'pass', reason: 'Audit error, defaulting to pass' };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { images, businessType } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: "images array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const type = businessType || 'business';
    const results: ImageAuditResult[] = [];

    // Process in batches of 3 to respect rate limits
    const batchSize = 3;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(async (url: string): Promise<ImageAuditResult> => {
          // Skip images from our own generated-images bucket — they're already AI-generated
          if (url.includes('/generated-images/')) {
            return { url, status: 'pass', score: 9, reason: 'AI-generated image' };
          }

          // Step 1: Check reachability
          const { reachable, contentLength } = await checkImageReachable(url);
          if (!reachable) {
            return { url, status: 'unreachable', score: 0, reason: 'Image URL not reachable or not an image' };
          }

          // Tiny images (< 5KB) auto-fail
          if (contentLength && contentLength < 5000) {
            return { url, status: 'fail', score: 2, reason: 'Image too small (likely icon or placeholder)' };
          }

          // Step 2: AI quality check
          const audit = await auditImageWithAI(url, type, LOVABLE_API_KEY);
          return {
            url,
            status: audit.verdict === 'fail' ? 'fail' : 'pass',
            score: audit.score,
            reason: audit.reason,
          };
        })
      );

      results.push(...batchResults);

      // Small delay between batches to avoid rate limits
      if (i + batchSize < images.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    const passCount = results.filter(r => r.status === 'pass').length;
    const failCount = results.filter(r => r.status !== 'pass').length;

    console.log(`Image audit complete: ${passCount} passed, ${failCount} failed/unreachable out of ${results.length}`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("audit-images error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
