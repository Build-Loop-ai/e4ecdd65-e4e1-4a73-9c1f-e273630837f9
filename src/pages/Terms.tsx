import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PitchLogo } from '@/components/ui/PitchLogo';

export default function Terms() {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: February 12, 2026</p>
        </div>

        <div className="prose prose-sm max-w-none text-foreground space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using Pitch ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. We reserve the right to update these terms at any time, and your continued use of the Service constitutes acceptance of any changes.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pitch is a SaaS platform that enables web designers and agencies to create AI-powered client proposals by scanning websites and generating professional preview pages. The Service includes website scanning, template-based pitch generation, email outreach, analytics tracking, and related features.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must create an account to use the Service. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to provide accurate and complete information when creating your account and to update it as necessary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Subscription & Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Pitch offers free and paid subscription plans. Paid plans are billed on a monthly recurring basis. You may cancel your subscription at any time through the billing settings. Cancellations take effect at the end of the current billing period. Refunds are provided at our discretion for unused service periods.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree not to use the Service to: (a) violate any applicable laws or regulations; (b) infringe upon the intellectual property rights of others; (c) send spam or unsolicited communications; (d) attempt to gain unauthorized access to the Service or its systems; (e) use the Service in any manner that could damage, disable, or impair the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              You retain ownership of all content you create using the Service. Pitch retains all rights to the platform, templates, and underlying technology. By using the Service, you grant Pitch a limited license to process and display your content as necessary to provide the Service.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              The Service is provided "as is" without warranties of any kind. Pitch shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service. Our total liability shall not exceed the amount you paid for the Service in the 12 months preceding the claim.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your account at any time for violations of these terms or for any other reason at our discretion. Upon termination, your right to use the Service will immediately cease. You may export your data before termination by contacting support.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms, please contact us at <span className="text-primary font-medium">support@pitch.app</span>.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
