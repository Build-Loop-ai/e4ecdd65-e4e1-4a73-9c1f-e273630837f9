import { ArrowRight, Globe, Sparkles, Zap, Eye, MessageSquare, BarChart3, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PitchLogo } from '@/components/ui/PitchLogo';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: Globe,
    title: 'Scrape Any Website',
    description: 'Enter a URL and we extract their logo, colors, images, and content automatically.',
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Magic',
    description: 'Our AI structures content into professional sections: hero, services, about, gallery.',
    gradient: 'from-violet-500/20 to-purple-500/20'
  },
  {
    icon: Eye,
    title: 'Stunning Templates',
    description: 'Five distinct, high-end templates designed to impress any prospect.',
    gradient: 'from-pink-500/20 to-rose-500/20'
  },
  {
    icon: MessageSquare,
    title: 'Collect Feedback',
    description: 'Prospects can leave comments directly on the preview. Close deals faster.',
    gradient: 'from-amber-500/20 to-orange-500/20'
  },
  {
    icon: BarChart3,
    title: 'Track Everything',
    description: 'See who viewed your pitch, when, and for how long. Know when to follow up.',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    icon: Zap,
    title: 'Share Instantly',
    description: 'One-click shareable links. No login required for prospects to view.',
    gradient: 'from-indigo-500/20 to-blue-500/20'
  }
];

const stats = [
  { value: '10x', label: 'Faster proposals' },
  { value: '73%', label: 'Higher close rate' },
  { value: '2min', label: 'Average creation time' },
  { value: '500+', label: 'Designers trust us' }
];

const Index = () => {
  const { user, loading } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-primary/3 via-transparent to-accent/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <PitchLogo size="md" />
          {!loading && (
            <div className="flex items-center gap-3">
              {user ? (
                <Button asChild className="group">
                  <Link to="/dashboard">
                    Dashboard
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="hidden sm:inline-flex">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild className="group">
                    <Link to="/auth">
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section ref={heroRef} className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 relative min-h-screen flex items-center">
        <div className="container mx-auto max-w-6xl relative">
          <motion.div 
            className="text-center"
            style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
          >
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>Win more web design clients</span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-foreground tracking-tight mb-6 leading-[0.95]"
            >
              <span className="block">Pitch perfect.</span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Every time.
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Show prospects exactly how their new website could look. 
              <span className="text-foreground font-medium"> Create stunning previews that close deals.</span>
            </motion.p>
            
            {/* CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button size="lg" asChild className="px-8 h-14 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all group">
                <Link to={user ? "/dashboard" : "/auth"}>
                  Start Creating for Free
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-14 text-base font-medium group" asChild>
                <Link to="/auth">
                  <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>

            {/* Trust indicators */}
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-sm text-muted-foreground mt-6"
            >
              ✓ No credit card required · ✓ Free forever plan · ✓ Setup in 2 minutes
            </motion.p>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 md:mt-20 relative"
          >
            {/* Glow effect behind the card */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50 -z-10 scale-95" />
            
            <div className="relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80 hover:bg-red-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition-colors cursor-pointer" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80 hover:bg-green-400 transition-colors cursor-pointer" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1.5 rounded-lg bg-background/80 text-xs text-muted-foreground border border-border/50 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500/20 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                    pitch.app/preview/acme-corp
                  </div>
                </div>
              </div>
              
              {/* Preview content mockup */}
              <div className="aspect-[16/9] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
                {/* Animated grid background */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                  }} />
                </div>
                
                {/* Mock hero section */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div 
                    className="text-center px-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                  >
                    <motion.div 
                      className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/30"
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <span className="text-3xl font-bold text-white">A</span>
                    </motion.div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                      Acme Corporation
                    </h3>
                    <p className="text-white/60 max-w-md mx-auto mb-6 text-sm sm:text-base">
                      Building the future, one solution at a time
                    </p>
                    <div className="inline-flex gap-3">
                      <motion.div 
                        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-lg shadow-primary/30"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        Get Started
                      </motion.div>
                      <motion.div 
                        className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium border border-white/20 backdrop-blur-sm"
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.15)" }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        Learn More
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Decorative floating elements */}
                <motion.div 
                  className="absolute top-10 right-10 w-32 h-32 bg-primary/30 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                  className="absolute bottom-10 left-10 w-24 h-24 bg-accent/30 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                />
                <motion.div 
                  className="absolute top-1/2 right-20 w-16 h-16 bg-cyan-500/20 rounded-full blur-xl"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            </div>
            
            {/* Floating elements around the card */}
            <motion.div 
              className="absolute -top-6 -right-6 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center"
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-card border border-border shadow-lg text-sm font-medium flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">Live preview ready</span>
            </motion.div>
            
            <motion.div 
              className="absolute -bottom-4 right-8 px-4 py-2 rounded-full bg-card border border-border shadow-lg text-sm font-medium flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
            >
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-muted-foreground">142 views</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Marquee */}
      <section className="py-12 border-y border-border/50 bg-muted/20 backdrop-blur-sm overflow-hidden">
        <div className="flex animate-marquee">
          {[...stats, ...stats, ...stats].map((stat, index) => (
            <div key={index} className="flex items-center gap-12 px-12">
              <div className="flex items-center gap-4 whitespace-nowrap">
                <span className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {stat.value}
                </span>
                <span className="text-muted-foreground text-sm md:text-base">
                  {stat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 md:py-32 px-4 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
              How it works
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              From URL to pitch in{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                minutes
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to create client-winning previews
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-4">
            {[
              { number: '01', title: 'Enter URL', description: 'Paste your prospect\'s current website URL', icon: Globe },
              { number: '02', title: 'AI Analyzes', description: 'We extract and organize their content magically', icon: Sparkles },
              { number: '03', title: 'Pick Template', description: 'Choose the perfect look for their industry', icon: Eye },
              { number: '04', title: 'Share & Win', description: 'Send the link and close the deal', icon: Zap }
            ].map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Connector line */}
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-[2px]">
                    <div className="h-full bg-gradient-to-r from-border via-primary/30 to-border" />
                  </div>
                )}
                
                <div className="relative bg-card rounded-2xl p-6 border border-border hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group-hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-5xl font-bold text-primary/10 absolute top-4 right-4">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 md:py-32 px-4 bg-muted/30 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <span className="text-primary font-medium text-sm uppercase tracking-wider mb-4 block">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything you need to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                close deals
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for web design professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`} />
                <div className="relative p-6 rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/30 transition-all hover:shadow-xl group-hover:-translate-y-1 duration-300">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 md:py-32 px-4 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Quote marks */}
            <div className="absolute -top-8 -left-4 text-9xl font-serif text-primary/10 select-none">"</div>
            
            <div className="text-center relative z-10">
              <div className="inline-flex items-center gap-1 mb-8">
                {[...Array(5)].map((_, i) => (
                  <motion.svg 
                    key={i} 
                    className="w-6 h-6 text-yellow-400 fill-current" 
                    viewBox="0 0 20 20"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </div>
              
              <blockquote className="text-2xl sm:text-3xl md:text-4xl font-medium text-foreground mb-10 leading-relaxed">
                "Pitch helped me close <span className="text-primary">3 clients in my first week</span>. The previews look so professional, 
                prospects think I spent hours designing them."
              </blockquote>
              
              <div className="flex items-center justify-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-semibold text-lg shadow-lg shadow-primary/30">
                  JD
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-lg">James Davidson</p>
                  <p className="text-sm text-muted-foreground">Freelance Web Designer</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-3xl bg-gradient-to-br from-primary via-primary to-accent p-1 overflow-hidden shadow-2xl shadow-primary/30"
          >
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
              {/* Animated dots */}
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                backgroundSize: '30px 30px'
              }} />
            </div>
            
            <div className="relative bg-gradient-to-br from-primary via-primary to-accent rounded-[22px] p-12 md:p-16 text-center">
              <motion.h2 
                className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                Ready to win more clients?
              </motion.h2>
              <motion.p 
                className="text-lg md:text-xl text-white/80 mb-10 max-w-xl mx-auto"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Join designers and agencies who are closing deals faster with stunning website previews.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row items-center justify-center gap-4"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Button size="lg" variant="secondary" asChild className="px-8 h-14 text-base font-medium shadow-xl hover:shadow-2xl transition-all group">
                  <Link to="/auth">
                    Start Creating for Free
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/70 text-sm">
                {['No credit card required', 'Free forever plan', 'Cancel anytime'].map((text, i) => (
                  <motion.div 
                    key={text}
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Check className="h-4 w-4" />
                    <span>{text}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <PitchLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              © 2026 Pitch. Win clients with stunning website previews.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="hover:text-primary transition-colors">
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