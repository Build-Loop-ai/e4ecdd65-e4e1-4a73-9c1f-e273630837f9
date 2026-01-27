import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple hash function for IP privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(ip + 'preview-pro-salt')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32)
}

// Detect device type from user agent
function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad|playbook|silk/.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/.test(ua)) return 'mobile'
  return 'desktop'
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { preview_id, referrer, session_duration } = await req.json()

    if (!preview_id) {
      return new Response(
        JSON.stringify({ error: 'preview_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get client info
    const userAgent = req.headers.get('user-agent') || ''
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('cf-connecting-ip') || 
                     'unknown'
    
    const ipHash = await hashIP(clientIP)
    const deviceType = getDeviceType(userAgent)

    // Try to get geolocation from IP (using free ip-api.com)
    let country = null
    let city = null
    
    if (clientIP !== 'unknown' && clientIP !== '127.0.0.1') {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,country,city`)
        const geoData = await geoResponse.json()
        if (geoData.status === 'success') {
          country = geoData.country
          city = geoData.city
        }
      } catch (geoError) {
        console.log('Geolocation lookup failed:', geoError)
      }
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Insert visit record
    const { error } = await supabase
      .from('preview_visits')
      .insert({
        preview_id,
        device_type: deviceType,
        country,
        city,
        referrer: referrer || null,
        user_agent: userAgent,
        ip_hash: ipHash,
        session_duration: session_duration || null,
      })

    if (error) {
      console.error('Failed to insert visit:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to track visit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Track visit error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
