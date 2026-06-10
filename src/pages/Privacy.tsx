import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PitchLogo } from '@/components/ui/PitchLogo';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto max-w-3xl px-6 py-6 flex items-center justify-between">
          <Link to="/">
            <PitchLogo size="md" asLink={false} />
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" />
            Back
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 12, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly, including your name, email address, and business details when you create an account. We also collect usage data such as pages visited, features used, and device information to improve the Service. When you connect an email account, we store OAuth tokens securely to send emails on your behalf.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to: (a) provide and maintain the Service; (b) process your subscription and payments; (c) send transactional emails related to your account; (d) improve and personalize the Service; (e) monitor usage for security and abuse prevention. We do not sell your personal information to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. Data Storage & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely using industry-standard encryption and security practices. We use secure cloud infrastructure with regular backups. Access to user data is restricted to authorized personnel only. OAuth tokens and sensitive credentials are encrypted at rest.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Website Scanning</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you scan a website URL, we extract publicly available content (text, images, colors, logos) to generate pitch previews. This content is used solely for creating your proposals and is not shared with other users or third parties. You are responsible for ensuring you have the right to use scanned content in your proposals.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Analytics & Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you share a pitch preview link, we collect anonymized visitor data including device type, approximate location, and referrer information. This data is provided to you through the analytics dashboard to help you understand engagement. Visitor IP addresses are hashed and never stored in plain text.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use third-party services to operate the platform, including payment processing (Stripe), email deliverability (Warmy), and website scanning tools. These services have their own privacy policies and handle data in accordance with their terms. We only share the minimum information necessary for these services to function.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to maintain your session and authentication state. We do not use advertising or third-party tracking cookies. You can manage cookie preferences through your browser settings, but disabling essential cookies may prevent the Service from functioning properly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to: (a) access the personal data we hold about you; (b) request correction of inaccurate data; (c) request deletion of your data; (d) export your data in a portable format; (e) object to processing of your data. To exercise any of these rights, please contact us at the email below.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your account data for as long as your account is active. If you delete your account, we will remove your personal data within 30 days, except where we are required to retain it for legal or regulatory purposes. Anonymized usage data may be retained indefinitely for analytics purposes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us at <span className="text-primary font-medium">privacy@pitch.app</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
