import { ArrowRight, Globe, Sparkles, Zap, Eye, MessageSquare, BarChart3, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PitchLogo } from '@/components/ui/PitchLogo';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const features = [
  {
    icon: Globe,
    title: 'Scrape Any Website',
    description: 'Enter a URL and we extract their logo, colors, images, and content automatically.'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Organization',
    description: 'Our AI structures content into professional sections: hero, services, about, gallery.'
  },
  {
    icon: Eye,
    title: 'Stunning Templates',
    description: 'Five distinct, high-end templates designed to impress any prospect.'
  },
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Prospects can leave comments directly on the preview. Close deals faster.'
  },
  {
    icon: BarChart3,
    title: 'Track Everything',
    description: 'See who viewed your pitch, when, and for how long. Know when to follow up.'
  },
  {
    icon: Zap,
    title: 'Share Instantly',
    description: 'One-click shareable links. No login required for prospects to view.'
  }
];

const steps = [
  { number: '01', title: 'Enter URL', description: 'Paste your prospect\'s current website' },
  { number: '02', title: 'AI Analyzes', description: 'We extract and organize their content' },
  { number: '03', title: 'Pick Template', description: 'Choose the perfect look for their industry' },
  { number: '04', title: 'Share & Win', description: 'Send the link and close the deal' }
];

const Index = () => {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <PitchLogo size="md" />
          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild>
                  <Link to="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-5xl relative">
          <motion.div 
            className="text-center"
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              <span>Win more web design clients</span>
            </motion.div>
            
            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-bold text-foreground tracking-tight mb-6 leading-[1.1]"
            >
              Pitch perfect.
              <br />
              <span className="text-primary">Every time.</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Show prospects exactly how their new website could look. 
              Create stunning previews that close deals.
            </motion.p>
            
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="px-8 h-12 text-base">
                <Link to={user ? "/dashboard" : "/auth"}>
                  Start for Free
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                No credit card required
              </p>
            </motion.div>
          </motion.div>

          {/* Hero Image / Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-xl border border-border bg-card shadow-elevated overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-chart-4/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 rounded-md bg-background text-xs text-muted-foreground">
                    pitch.app/preview/acme-corp
                  </div>
                </div>
              </div>
              
              {/* Preview content mockup */}
              <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Mock hero section */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center px-8">
                    <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                      <span className="text-2xl font-bold text-primary">A</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                      Acme Corporation
                    </h3>
                    <p className="text-white/60 max-w-md mx-auto mb-6">
                      Building the future, one solution at a time
                    </p>
                    <div className="inline-flex gap-3">
                      <div className="px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">
                        Get Started
                      </div>
                      <div className="px-6 py-2 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20">
                        Learn More
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
                <div className="absolute bottom-10 left-10 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
              </div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-card border border-border shadow-elevated text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">Live preview ready to share</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              From URL to pitch in minutes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create client-winning previews
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-full h-[2px] bg-border" />
                )}
                
                <div className="relative bg-card rounded-xl p-6 border border-border">
                  <div className="text-4xl font-bold text-primary/20 mb-4">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need to close deals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for web design professionals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/20 hover:shadow-elevated transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-chart-4 fill-current" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            
            <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
              "Pitch helped me close 3 clients in my first week. The previews look so professional, 
              prospects think I spent hours designing them."
            </blockquote>
            
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                JD
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">James Davidson</p>
                <p className="text-sm text-muted-foreground">Freelance Web Designer</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-2xl bg-primary p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            </div>
            
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to win more clients?
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Join designers and agencies who are closing deals faster with stunning website previews.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" variant="secondary" asChild className="px-8 h-12">
                  <Link to="/auth">
                    Start for Free
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-primary-foreground/70 text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Free forever plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <PitchLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2026 Pitch. Win clients with stunning website previews.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="hover:text-foreground transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
