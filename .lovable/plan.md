

## Remove APP_ORIGIN Secret Dependency

The `APP_ORIGIN` secret is used in two edge functions to build URLs. Instead of requiring it as a secret, we can dynamically derive the origin from the incoming request headers (which already partially happens in `warmy-register`).

### Changes

**1. `supabase/functions/auto-outreach/index.ts` (line ~189)**

Replace the static `Deno.env.get("APP_ORIGIN")` fallback with dynamic origin detection from request headers, matching the pattern already used in `warmy-register`:

```typescript
const requestOrigin = req.headers.get("origin");
const refererUrl = req.headers.get("referer");
const refererOrigin = refererUrl ? new URL(refererUrl).origin : null;
const appOrigin = requestOrigin || refererOrigin || Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.lovable.app');
```

This will be extracted once near the top of the function and reused where `previewUrl` is built.

**2. `supabase/functions/warmy-register/index.ts` (line ~101)**

Remove the `APP_ORIGIN` env fallback from the existing chain. The function already reads `origin` and `referer` headers. Update the final fallback to derive from `SUPABASE_URL` instead:

```typescript
const appOrigin = requestOrigin || refererOrigin || Deno.env.get("SUPABASE_URL")!.replace('.supabase.co', '.lovable.app');
```

### Technical Details

- Both functions are called from the browser via `supabase.functions.invoke`, so the `origin` header will always be present in normal usage.
- The `SUPABASE_URL` fallback is a safety net that doesn't require any manual secret configuration.
- After this change, `APP_ORIGIN` is no longer needed as a secret, reducing setup friction when remixing the app.

