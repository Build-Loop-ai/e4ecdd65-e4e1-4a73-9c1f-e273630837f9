

## Fix: Language-Aware Content Generation

### Problem
The demo generates Dutch content regardless of the source website's language because:
- The AI system prompt hardcodes all example titles and CTA text in Dutch
- Default/fallback values in code are all Dutch
- There is no instruction telling the AI to detect and match the source website's language
- A duplicate JSON block in the prompt may confuse the AI model

### Solution

**1. Update `process-content` edge function** (`supabase/functions/process-content/index.ts`)
- Add a clear "LANGUAGE DETECTION" section at the top of the system prompt instructing the AI to detect the source website's language and generate ALL content in that same language
- Replace all Dutch example titles/CTAs with English defaults, and tell the AI to translate them appropriately based on detected language
- Remove the duplicate JSON schema block (lines 370-396)
- Add a `language` field to the expected JSON output so the frontend knows what language was detected

**2. Update default fallbacks** (`src/lib/businessIntelligence.ts`)
- Change `DEFAULT_ADAPTED_CONTENT` from Dutch to English:
  - "Onze Diensten" -> "Our Services"
  - "Galerij" -> "Gallery"  
  - "Over Ons" -> "About Us"
  - "Wat Klanten Zeggen" -> "What Clients Say"
  - "Contact" stays "Contact"

**3. Update fallback defaults in the edge function**
- Change the hardcoded Dutch fallback values (lines 571-578) from Dutch to English
- Change gallery fallback title from "Galerij" to "Gallery"

### Files to Change
- `supabase/functions/process-content/index.ts` - Fix prompt, remove duplicate, add language detection
- `src/lib/businessIntelligence.ts` - English defaults

### Technical Details

The key prompt additions will be:

```
## LANGUAGE DETECTION (CRITICAL - DO THIS FIRST)
Detect the language of the source website from its content.
ALL generated text (headlines, section titles, CTAs, descriptions, value props)
MUST be in the SAME language as the source website.
If the website is in English, output English. If Dutch, output Dutch. Etc.
NEVER default to Dutch for an English website.
```

The adaptive section titles table will become language-neutral instructions like:
```
Use industry-appropriate titles IN THE DETECTED LANGUAGE.
For English: "Our Services", "Gallery", "About Us", etc.
For Dutch: "Onze Diensten", "Galerij", "Over Ons", etc.
```

