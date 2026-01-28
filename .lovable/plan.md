
# Email Automation with Gmail & Outlook Integration

## Overview

Allow users to connect their own Gmail and Outlook accounts via OAuth 2.0, then automate sending personalized pitch emails directly from the platform.

## Current State

| Component | Status |
|-----------|--------|
| `outreach_emails` table | Exists (tracks sent emails) |
| Email sending capability | Not implemented |
| OAuth integrations | Not available |
| Email UI in leads | Only mailto: links |

## Architecture

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      EMAIL AUTOMATION SYSTEM                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐     ┌─────────────────────────────────────────────┐   │
│  │   SETTINGS  │────▶│ Connect Gmail / Outlook via OAuth 2.0       │   │
│  └─────────────┘     │ Store encrypted tokens in email_connections │   │
│                      └─────────────────────────────────────────────┘   │
│                                       │                                 │
│                                       ▼                                 │
│  ┌─────────────┐     ┌─────────────────────────────────────────────┐   │
│  │  LEADS /    │────▶│ "Send Pitch Email" Button                   │   │
│  │  PREVIEWS   │     │ Opens compose dialog with template          │   │
│  └─────────────┘     └─────────────────────────────────────────────┘   │
│                                       │                                 │
│                                       ▼                                 │
│                      ┌─────────────────────────────────────────────┐   │
│                      │ Edge Function: send-email                    │   │
│                      │ • Fetch user's OAuth tokens                  │   │
│                      │ • Call Gmail/Outlook API                     │   │
│                      │ • Log to outreach_emails table               │   │
│                      └─────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Database Schema

### New Table: `email_connections`

Stores OAuth tokens for connected email providers.

```sql
CREATE TABLE public.email_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'outlook')),
  email_address TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- RLS Policies
ALTER TABLE public.email_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own email connections"
  ON public.email_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### New Table: `email_templates`

Pre-built templates for pitch emails.

```sql
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Part 2: OAuth Flow

### Gmail OAuth

| Step | Description |
|------|-------------|
| 1 | User clicks "Connect Gmail" in Settings |
| 2 | Redirect to Google OAuth consent screen |
| 3 | Google redirects back with authorization code |
| 4 | Edge function exchanges code for tokens |
| 5 | Store tokens in `email_connections` table |

### Outlook OAuth

| Step | Description |
|------|-------------|
| 1 | User clicks "Connect Outlook" in Settings |
| 2 | Redirect to Microsoft OAuth consent screen |
| 3 | Microsoft redirects back with authorization code |
| 4 | Edge function exchanges code for tokens |
| 5 | Store tokens in `email_connections` table |

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `GOOGLE_CLIENT_ID` | Gmail OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | Gmail OAuth secret |
| `MICROSOFT_CLIENT_ID` | Outlook OAuth app ID |
| `MICROSOFT_CLIENT_SECRET` | Outlook OAuth secret |

---

## Part 3: Edge Functions

### 1. `oauth-callback` Function

Handles OAuth redirects from Google/Microsoft.

```typescript
// POST /oauth-callback
{
  "provider": "gmail" | "outlook",
  "code": "authorization_code",
  "redirect_uri": "https://..."
}

// Returns: { success: true, email: "user@gmail.com" }
```

### 2. `send-email` Function

Sends emails via connected provider.

```typescript
// POST /send-email
{
  "to": "recipient@example.com",
  "toName": "John's Bakery",
  "subject": "Your new website preview is ready!",
  "bodyHtml": "<html>...</html>",
  "previewId": "uuid",
  "leadId": "uuid" // optional
}

// Returns: { success: true, messageId: "..." }
```

### 3. `refresh-token` Function

Refreshes expired OAuth tokens automatically.

---

## Part 4: Settings UI - Email Integrations

Add new section to Settings page:

```text
┌─────────────────────────────────────────────────────────────────┐
│  🔗 Email Integrations                                          │
│  Connect your email to send pitch emails directly               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📧 Gmail                                                 │   │
│  │                                                          │   │
│  │ ○ Not connected                                          │   │
│  │                                                          │   │
│  │                              [ Connect Gmail ]           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 📬 Outlook                                               │   │
│  │                                                          │   │
│  │ ○ Not connected                                          │   │
│  │                                                          │   │
│  │                              [ Connect Outlook ]         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

When connected:
┌─────────────────────────────────────────────────────────────────┐
│  │ ✅ Gmail - john@gmail.com                                │   │
│  │    Connected on Jan 28, 2026                             │   │
│  │                                                          │   │
│  │                   [ Send Test ]  [ Disconnect ]          │   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Part 5: Send Pitch Email Dialog

Add "Send Email" button to leads and preview management.

### Dialog Design

```text
┌─────────────────────────────────────────────────────────────────┐
│  ✉️ Send Pitch Email                                     [ X ]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  From: john@gmail.com (Gmail)  ▼                               │
│                                                                 │
│  To:                                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ info@johnsbakery.com                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Recipient Name:                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ John's Bakery                                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Subject:                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Your new website preview is ready, John's Bakery!        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Template: [ Default Pitch Email ▼ ]                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Preview of HTML email...                                 │   │
│  │                                                          │   │
│  │ Hi John's Bakery,                                        │   │
│  │                                                          │   │
│  │ I've created a modern website preview for your           │   │
│  │ business. Click below to see it:                         │   │
│  │                                                          │   │
│  │      [ View Your Preview ]                               │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                           [ Cancel ]  [ Send Email ]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Email Template Variables

| Variable | Replaced With |
|----------|---------------|
| `{{recipient_name}}` | Business name |
| `{{preview_url}}` | Full preview URL |
| `{{sender_name}}` | User's name from profile |
| `{{sender_business}}` | User's business name |

---

## Part 6: Email Template (HTML)

Professional pitch email template:

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .cta-button {
      background: {{primary_color}};
      color: white;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
    }
  </style>
</head>
<body style="font-family: system-ui; max-width: 600px; margin: 0 auto;">
  <h1>Hi {{recipient_name}},</h1>
  
  <p>I've created a modern website preview specifically for your business. 
  I'd love for you to take a look and let me know what you think!</p>
  
  <p style="text-align: center; margin: 32px 0;">
    <a href="{{preview_url}}" class="cta-button">
      View Your Preview
    </a>
  </p>
  
  <p>If you have any questions or would like to discuss changes, 
  just reply to this email.</p>
  
  <p>Best regards,<br>
  {{sender_name}}<br>
  {{sender_business}}</p>
</body>
</html>
```

---

## Part 7: Integration Points

### In SavedLeadsList.tsx

Add "Send Email" to dropdown menu:

```typescript
<DropdownMenuItem onClick={() => openSendEmailDialog(lead)}>
  <Send className="h-4 w-4 mr-2" />
  Send Pitch Email
</DropdownMenuItem>
```

### In ManagePreview.tsx

Add "Send Email" button to toolbar:

```typescript
<Button onClick={() => openSendEmailDialog(preview)}>
  <Send className="h-4 w-4 mr-2" />
  Send to Client
</Button>
```

---

## Part 8: Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/oauth-callback/index.ts` | CREATE | Handle OAuth redirects |
| `supabase/functions/send-email/index.ts` | CREATE | Send emails via Gmail/Outlook |
| `src/components/email/EmailConnectionCard.tsx` | CREATE | Connection UI component |
| `src/components/email/SendEmailDialog.tsx` | CREATE | Compose email dialog |
| `src/hooks/useEmailConnections.ts` | CREATE | Manage connections state |
| `src/lib/emailTemplates.ts` | CREATE | Default email templates |
| `src/pages/Settings.tsx` | MODIFY | Add Email Integrations section |
| `src/components/leads/SavedLeadsList.tsx` | MODIFY | Add Send Email action |
| `src/components/manage/ManageToolbar.tsx` | MODIFY | Add Send Email button |

---

## Part 9: User Flow

### Connect Email Account

1. User goes to Settings → Email Integrations
2. Clicks "Connect Gmail" or "Connect Outlook"
3. Redirected to OAuth consent screen
4. Grants permissions
5. Redirected back to app
6. Connection saved and displayed

### Send Pitch Email

1. User views a lead or preview
2. Clicks "Send Pitch Email"
3. Dialog opens with pre-filled data
4. User reviews and edits message
5. Clicks "Send Email"
6. Email sent via connected account
7. Logged in `outreach_emails` table
8. Success notification shown

---

## Required Setup

Before implementation, you'll need to:

1. **Create Google Cloud OAuth App**
   - Go to Google Cloud Console
   - Create OAuth 2.0 credentials
   - Add redirect URI
   - Get Client ID and Secret

2. **Create Microsoft Azure AD App**
   - Go to Azure Portal → App Registrations
   - Create new registration
   - Add redirect URI
   - Get Client ID and Secret

3. **Add Secrets to Project**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MICROSOFT_CLIENT_ID`
   - `MICROSOFT_CLIENT_SECRET`

---

## Security Considerations

| Risk | Mitigation |
|------|------------|
| Token theft | Tokens stored server-side only, never exposed to client |
| Token expiry | Auto-refresh mechanism before sending |
| Unauthorized access | RLS policies ensure users only access own connections |
| OAuth scope | Request minimal permissions (send email only) |

