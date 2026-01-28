export interface EmailTemplateVariables {
  recipientName: string;
  previewUrl: string;
  senderName: string;
  senderBusiness: string;
  primaryColor?: string;
}

export const DEFAULT_PITCH_SUBJECT = "Your new website preview is ready, {{recipient_name}}!";

export const DEFAULT_PITCH_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background: {{primary_color}};
      color: white !important;
      padding: 16px 32px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
    }
    .cta-button:hover {
      opacity: 0.9;
    }
    .cta-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .preview-box {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
      text-align: center;
    }
    .preview-box img {
      max-width: 100%;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="color: {{primary_color}}; margin-bottom: 0;">Hi {{recipient_name}},</h1>
  </div>
  
  <p>I've created a modern website preview specifically designed for your business. I'd love for you to take a look and share your thoughts!</p>
  
  <div class="cta-wrapper">
    <a href="{{preview_url}}" class="cta-button" style="background: {{primary_color}};">
      👀 View Your Preview
    </a>
  </div>
  
  <p>This preview showcases:</p>
  <ul>
    <li>A fresh, modern design tailored to your brand</li>
    <li>Mobile-responsive layout</li>
    <li>Clear calls-to-action for your customers</li>
    <li>Professional imagery and content structure</li>
  </ul>
  
  <p>If you have any questions or would like to discuss changes, simply reply to this email. I'm here to help!</p>
  
  <div class="footer">
    <p>Best regards,<br>
    <strong>{{sender_name}}</strong><br>
    {{sender_business}}</p>
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
    .replace(/\{\{primary_color\}\}/g, variables.primaryColor || '#3b82f6');
}

export function renderSubject(subject: string, recipientName: string): string {
  return subject.replace(/\{\{recipient_name\}\}/g, recipientName);
}
