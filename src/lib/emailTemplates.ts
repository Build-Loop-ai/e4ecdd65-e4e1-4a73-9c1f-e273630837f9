export interface EmailTemplateVariables {
  recipientName: string;
  previewUrl: string;
  senderName: string;
  senderBusiness: string;
  primaryColor?: string;
}

export const DEFAULT_PITCH_SUBJECT = "Quick idea for {{recipient_name}}";

/**
 * Wraps a plain-text email body in minimal HTML that looks like a real email.
 * No buttons, no fancy styling — just plain text with a clickable link.
 */
export function wrapPlainTextEmail(body: string): string {
  // Convert plain text line breaks to <br> and auto-link URLs
  const htmlBody = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")
    .replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" style="color: #1a73e8; text-decoration: none;">$1</a>'
    );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1a1a1a; background: #ffffff; margin: 0; padding: 20px;">
  <div style="max-width: 600px;">
    ${htmlBody}
  </div>
</body>
</html>`;
}

export const DEFAULT_PITCH_TEMPLATE = `Hi {{recipient_name}},

I came across your business and put together a quick website concept — no strings attached. Just wanted to show you what's possible.

Here's the preview: {{preview_url}}

If anything catches your eye, just reply — happy to chat.

{{sender_name}}`;

export function renderEmailTemplate(
  template: string,
  variables: EmailTemplateVariables
): string {
  return template
    .replace(/\{\{recipient_name\}\}/g, variables.recipientName)
    .replace(/\{\{preview_url\}\}/g, variables.previewUrl)
    .replace(/\{\{sender_name\}\}/g, variables.senderName)
    .replace(/\{\{sender_business\}\}/g, variables.senderBusiness || '')
    .replace(/\{\{primary_color\}\}/g, variables.primaryColor || '#4F46E5');
}

export function renderSubject(subject: string, recipientName: string): string {
  return subject.replace(/\{\{recipient_name\}\}/g, recipientName);
}
