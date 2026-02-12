export interface EmailTemplateVariables {
  recipientName: string;
  previewUrl: string;
  senderName: string;
  senderBusiness: string;
  primaryColor?: string;
}

export const DEFAULT_PITCH_SUBJECT = "I built something for {{recipient_name}} — take a look";

export const DEFAULT_PITCH_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.7;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
    }
    .wrapper {
      max-width: 520px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .greeting {
      font-size: 17px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 20px;
    }
    p {
      font-size: 15px;
      color: #374151;
      margin: 0 0 16px 0;
    }
    .cta-wrapper {
      margin: 32px 0;
    }
    .cta-button {
      display: inline-block;
      background: {{primary_color}};
      color: #ffffff !important;
      padding: 14px 28px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      letter-spacing: -0.01em;
    }
    .divider {
      border: none;
      border-top: 1px solid #f0f0f0;
      margin: 32px 0;
    }
    .signature {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.6;
    }
    .signature strong {
      color: #1a1a1a;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="greeting">Hi {{recipient_name}},</div>
    
    <p>I put together a website concept for your business — no commitment, just wanted to show you what's possible.</p>
    
    <div class="cta-wrapper">
      <a href="{{preview_url}}" class="cta-button" style="background: {{primary_color}}; color: #ffffff !important;">
        View your preview →
      </a>
    </div>
    
    <p>It's fully responsive and built around your existing brand. If anything catches your eye, just reply to this email — happy to walk you through it.</p>
    
    <hr class="divider">
    
    <div class="signature">
      <strong>{{sender_name}}</strong><br>
      {{sender_business}}
    </div>
  </div>
</body>
</html>
`;

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
