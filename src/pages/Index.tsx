import { ArrowRight, Check, Play, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PitchLogo } from '@/components/ui/PitchLogo';
import { motion } from 'framer-motion';

const trustedBy = [
  'Studio Pixel', 'Webcraft Co', 'Digital Maven', 'Starter Labs', 'Artisan Dev'
];

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <PitchLogo size="md" />
          {!loading && (
            <div className="flex items-center gap-2">
              {user ? (
                <Button asChild size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero - clean gradient */}
      <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 px-6 overflow-hidden">
        {/* Simple purple to white gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/15 via-primary/5 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl relative">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
            >
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">The outreach tool for web designers</span>
            </motion.div>

            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
              Turn any website into a
              <span className="block text-primary">
                winning proposal
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Scan your prospect's site. Our AI rebuilds it with stunning templates. 
              Share a preview link that closes the deal.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <Button size="lg" asChild className="h-12 px-6 text-base shadow-lg shadow-primary/20 group">
                <Link to={user ? "/dashboard" : "/auth"}>
                  Start for free
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" asChild>
                <Link to="/auth">
                  <Play className="h-4 w-4 mr-2" />
                  See how it works
                </Link>
              </Button>
            </div>

            {/* Trust line */}
            <p className="text-sm text-muted-foreground">
              Free forever · No credit card · 2 min setup
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-y border-border/40">
        <div className="container mx-auto px-6">
          <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8">
            Trusted by leading design studios
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            {trustedBy.map((name) => (
              <span key={name} className="text-foreground/40 font-semibold text-lg hover:text-primary transition-colors">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - PRIMARY BACKGROUND */}
      <section className="relative py-24 md:py-32 px-6 bg-primary overflow-hidden">
        {/* Subtle lighter areas */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-white/70">
              Three steps to your next closed deal
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Scan any site',
                description: 'Paste a URL. We extract logos, colors, images, and copy in seconds.'
              },
              {
                step: '02', 
                title: 'AI rebuilds it',
                description: 'Choose from 5 premium templates. Content is organized beautifully.'
              },
              {
                step: '03',
                title: 'Share & close',
                description: 'Send a branded link. Track views. Collect feedback. Win the client.'
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors"
              >
                <span className="text-6xl font-bold text-white/20 block mb-4">
                  {item.step}
                </span>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-white/70 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden">
        {/* Subtle purple glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to{' '}
              <span className="text-primary">close more deals</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Built specifically for web designers and agencies
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Deep website scanning',
              'Brand color extraction',
              '5 premium templates',
              'AI content organization',
              'One-click sharing',
              'View tracking & analytics',
              'Client feedback collection',
              'Custom branding'
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <Check className="h-4 w-4 text-primary group-hover:text-white transition-colors" />
                </div>
                <span className="font-medium text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial - gradient purple to white */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-gradient-to-b from-primary to-primary/80">
        {/* Light accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-3xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="flex justify-center gap-1 mb-8">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-6 h-6 text-white fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-4xl font-medium text-white mb-10 leading-relaxed">
              "Pitch cut my proposal time from 3 hours to 5 minutes. I've closed 4 new clients this month alone."
            </blockquote>
            
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-semibold text-lg border border-white/30">
                MR
              </div>
              <div className="text-left">
                <p className="font-semibold text-white text-lg">Maria Rodriguez</p>
                <p className="text-white/70">Founder, Studio Pixel</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 md:py-32 px-6 relative overflow-hidden">
        {/* Subtle gradient from top */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary/10 to-transparent" />
        
        <div className="container mx-auto max-w-2xl relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Ready to win more clients?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join 500+ designers who close deals faster with Pitch
            </p>
            <Button size="lg" asChild className="h-14 px-8 text-lg shadow-xl shadow-primary/25 group">
              <Link to="/auth">
                Get started for free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/40">
        <div className="container mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <PitchLogo size="sm" />
          <p className="text-sm text-muted-foreground">
            © 2026 Pitch
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-primary transition-colors">Log in</Link>
            <Link to="/auth" className="hover:text-primary transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;