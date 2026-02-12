import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const {
      recipientName,
      businessName,
      businessType,
      industry,
      previewUrl,
      senderName,
      senderBusiness,
      language,
      services,
      heroHeadline,
      heroSubheadline,
      targetAudience,
    } = await req.json();

    const businessContext = [
      businessName && `Business name: ${businessName}`,
      businessType && `Business type: ${businessType}`,
      industry && `Industry: ${industry}`,
      targetAudience && `Target audience: ${targetAudience}`,
      services?.length && `Key services: ${services.slice(0, 5).join(", ")}`,
      heroHeadline && `Their current headline: "${heroHeadline}"`,
      heroSubheadline && `Their current subheadline: "${heroSubheadline}"`,
    ]
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are a world-class cold email copywriter. You write emails that feel like they came from a real person who genuinely looked at someone's business — not a mass marketing tool.

RULES:
1. Write in ${language || "the same language as the business's content (detect from their headline/services)"}
2. NO HTML formatting, NO buttons, NO fancy styling. This should look like a plain Gmail/Outlook email.
3. Keep it SHORT — 3-5 sentences max for the body. Busy business owners skim.
4. Sound like a real human. Use conversational tone. No corporate jargon. No "I hope this email finds you well."
5. Reference something SPECIFIC about their business (a service they offer, their specialty, their vibe) to show you actually looked at them.
6. The pitch: you built a modern website preview/concept for them. Make them curious enough to click the link.
7. Don't oversell. Don't be pushy. Be helpful and genuine.
8. End with a casual, low-pressure CTA — just reply if interested.
9. The link should be embedded naturally in the text, not as a standalone CTA button.
10. NO emojis. NO bullet points. NO bold text. NO exclamation marks (max 1 in entire email).
11. Sign off with just the sender's first name (casual, like a real email).

SUBJECT LINE RULES:
- Under 50 characters
- Curiosity-driven, NOT salesy
- Reference their business name or type specifically
- Examples of GOOD subjects: "quick idea for [business]", "[name] — saw your site", "thought about [business name]"
- Examples of BAD subjects: "Your New Website Is Ready!", "Exclusive Offer Inside", "I Built Something Amazing"`;

    const userPrompt = `Write a cold pitch email for this business:

${businessContext}

Recipient name: ${recipientName || "the business owner"}
Preview URL to include: ${previewUrl}
Sender name: ${senderName || "the sender"}
Sender business: ${senderBusiness || "a web design service"}

Return a JSON object with exactly these fields:
{
  "subject": "the subject line",
  "body": "the full email body as plain text (with line breaks as \\n)"
}

IMPORTANT: Return ONLY the JSON object, nothing else.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway returned ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse JSON from the AI response (handle markdown code blocks)
    let parsed: { subject: string; body: string };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsed = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", content);
      // Fallback
      parsed = {
        subject: `Quick idea for ${businessName || recipientName || "your business"}`,
        body: `Hi ${recipientName || "there"},\n\nI came across your business and put together a quick website concept — no strings attached. Just wanted to show you what's possible.\n\nHere's the preview: ${previewUrl}\n\nIf anything catches your eye, just reply — happy to chat.\n\n${senderName || "Cheers"}`,
      };
    }

    return new Response(
      JSON.stringify({ success: true, subject: parsed.subject, body: parsed.body }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("generate-email-copy error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate email copy" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
