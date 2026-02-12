import { ArrowRight, Check, Play, Zap, Globe, Palette, Layout, BarChart3, Mail, MessageSquare, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PitchLogo } from '@/components/ui/PitchLogo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useState } from 'react';
import heroGradient from '@/assets/hero-gradient.png';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { TiltCard } from '@/components/animations/TiltCard';

const trustedBy = [
  'Studio Pixel', 'Webcraft Co', 'Digital Maven', 'Starter Labs', 'Artisan Dev'
];

const features = [
  { icon: Globe, title: 'Deep website scanning', desc: 'Extract everything from any URL in seconds' },
  { icon: Palette, title: 'Brand color extraction', desc: 'AI detects and applies brand palettes' },
  { icon: Layout, title: '5 premium templates', desc: 'Stunning designs for every industry' },
  { icon: Sparkles, title: 'AI content organization', desc: 'Smart layout that converts visitors' },
  { icon: Share2, title: 'One-click sharing', desc: 'Beautiful preview links that impress' },
  { icon: BarChart3, title: 'View tracking & analytics', desc: 'Know exactly who opened your pitch' },
  { icon: MessageSquare, title: 'Client feedback', desc: 'Collect reactions directly on the preview' },
  { icon: Mail, title: 'Built-in email outreach', desc: 'Send pitches with warmup protection' },
];

const testimonials = [
  {
    quote: "Pitch cut my proposal time from 3 hours to 5 minutes. I've closed 4 new clients this month alone.",
    name: 'Maria Rodriguez',
    role: 'Founder, Studio Pixel',
    initials: 'MR',
  },
  {
    quote: "The preview links look so professional, clients think I spent days on the proposal. It's my secret weapon.",
    name: 'James Chen',
    role: 'Lead Designer, Webcraft Co',
    initials: 'JC',
  },
  {
    quote: "I went from cold emails to closed deals. The analytics show me exactly who's interested.",
    name: 'Sophie van Dijk',
    role: 'Freelance Designer',
    initials: 'SD',
  },
];

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, type: 'spring' }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}{suffix}
      </motion.span>
    </motion.span>
  );
}

const Index = () => {
  const { user, loading } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const featuresScrollRef = useRef<HTMLDivElement>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const { scrollYProgress } = useScroll();

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 rounded-2xl px-6 h-14 flex items-center justify-between"
        >
          <PitchLogo size="md" />
          {!loading && (
            <div className="flex items-center gap-1">
              {user ? (
                <Button asChild size="sm" className="rounded-xl">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="rounded-xl text-foreground/70 hover:text-foreground">
                    <Link to="/auth">Log in</Link>
                  </Button>
                  <MagneticButton className="inline-flex items-center justify-center rounded-xl shadow-md shadow-primary/20 bg-primary text-primary-foreground text-sm font-medium h-9 px-3 hover:bg-primary/90 transition-colors">
                    <Link to="/auth">Get Started</Link>
                  </MagneticButton>
                </>
              )}
            </div>
          )}
        </motion.div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-24 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${heroGradient})` }} />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
        
        <div className="container mx-auto max-w-4xl relative">
          <motion.div className="text-center" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm mb-8"
            >
              <div className="h-6 w-6 rounded-md bg-white/20 flex items-center justify-center">
                <Zap className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-medium text-white">The outreach tool for web designers</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="inline-block">
                Turn any website into a
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="block text-white/90">
                winning proposal
              </motion.span>
            </h1>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Scan your prospect's site. Our AI rebuilds it with stunning templates. 
              Share a preview link that closes the deal.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              <MagneticButton className="inline-flex items-center justify-center h-12 px-6 text-base shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-xl font-medium transition-colors group">
                <Link to={user ? "/dashboard" : "/auth"} className="flex items-center">
                  Start for free
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </MagneticButton>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl" asChild>
                <Link to="/auth">
                  <Play className="h-4 w-4 mr-2" />
                  See how it works
                </Link>
              </Button>
            </motion.div>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-sm text-white/70">
              Free forever · No credit card · 2 min setup
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Trusted by */}
      <section className="py-12 border-y border-border/40 overflow-hidden">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-8 px-6">
          Trusted by leading design studios
        </p>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />
          <motion.div
            className="flex gap-16 whitespace-nowrap"
            animate={{ x: ['0%', '-50%'] }}
            transition={{ x: { repeat: Infinity, repeatType: 'loop', duration: 20, ease: 'linear' } }}
          >
            {[...trustedBy, ...trustedBy, ...trustedBy, ...trustedBy].map((name, i) => (
              <span key={i} className="text-foreground/30 font-semibold text-xl flex-shrink-0">{name}</span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-foreground text-background">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '500+', label: 'Active designers' },
              { value: '12k', label: 'Pitches sent' },
              { value: '3.2x', label: 'Higher close rate' },
              { value: '5 min', label: 'Avg. pitch time' },
            ].map((stat, index) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-background/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 md:py-32 px-6 bg-background overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-5xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">Three steps to your next closed deal</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Scan any site', description: 'Paste a URL. We extract logos, colors, images, and copy in seconds.', gradient: 'from-primary/10 to-primary/5' },
              { step: '02', title: 'AI rebuilds it', description: 'Choose from 5 premium templates. Content is organized beautifully.', gradient: 'from-primary/15 to-primary/5' },
              { step: '03', title: 'Share & close', description: 'Send a branded link. Track views. Collect feedback. Win the client.', gradient: 'from-primary/10 to-primary/5' }
            ].map((item, index) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: index * 0.15 }} viewport={{ once: true }}>
                <TiltCard tiltAmount={8} glareEnabled={true} glareColor="rgba(79, 70, 229, 0.15)" className="h-full">
                  <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${item.gradient} border border-border hover:border-primary/40 transition-all h-full group`}>
                    <motion.span className="text-7xl font-black text-primary/15 block mb-4 transition-all group-hover:text-primary/30 group-hover:scale-110 origin-left" whileHover={{ scale: 1.1 }}>
                      {item.step}
                    </motion.span>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/20 rounded-tr-xl group-hover:border-primary/50 group-hover:w-10 group-hover:h-10 transition-all" />
                  </div>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Premium icon containers */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="container mx-auto max-w-6xl px-6 mb-12">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to{' '}
              <span className="text-primary">close more deals</span>
            </h2>
            <p className="text-lg text-muted-foreground">Built specifically for web designers and agencies</p>
          </motion.div>
        </div>

        <div 
          ref={featuresScrollRef}
          className="flex gap-4 overflow-x-auto pt-4 pb-6 px-6 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true, amount: 0.3 }}
                className="flex-shrink-0 w-[280px] md:w-[320px] snap-center group"
              >
                <div className="relative p-6 rounded-2xl bg-card border border-border h-full hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                  {/* Premium icon container with gradient */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-md shadow-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:shadow-primary/30 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-500" strokeWidth={2.25} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  
                  <motion.div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    Learn more <ArrowRight className="h-3 w-3" />
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
          <div className="flex-shrink-0 w-6" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-24 md:py-32 px-6 overflow-hidden bg-gradient-to-b from-primary to-primary/80">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-white/10 rounded-full blur-3xl" />
        
        <div className="container mx-auto max-w-4xl relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Loved by designers</h2>
            <p className="text-lg text-white/70">See what our users are saying</p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <motion.div key={activeTestimonial} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-center">
              <p className="text-xl md:text-2xl text-white font-medium leading-relaxed mb-8">
                "{testimonials[activeTestimonial].quote}"
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonials[activeTestimonial].initials}
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{testimonials[activeTestimonial].name}</p>
                  <p className="text-white/60 text-xs">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activeTestimonial ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 md:py-32 px-6 bg-background">
        <div className="container mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Ready to close your next client?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
              Join hundreds of designers who use Pitch to create stunning proposals in minutes, not hours.
            </p>
            <MagneticButton className="inline-flex items-center justify-center h-14 px-8 text-lg shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-medium transition-colors group">
              <Link to={user ? "/dashboard" : "/auth"} className="flex items-center">
                Get started — it's free
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </MagneticButton>
            <p className="text-sm text-muted-foreground mt-4">No credit card required</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
          <PitchLogo size="sm" />
          <div className="flex items-center gap-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Pitch
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
