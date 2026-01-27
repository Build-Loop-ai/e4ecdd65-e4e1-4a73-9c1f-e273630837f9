import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  companyName?: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  logo?: string | null;
  isModern?: boolean;
  primaryColor?: string;
}

export function HeroSection({
  companyName,
  headline,
  subheadline,
  ctaText,
  logo,
  isModern = false,
  primaryColor,
}: HeroSectionProps) {
  if (isModern) {
    return (
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-foreground">
        {/* Gradient overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: primaryColor 
              ? `radial-gradient(circle at 30% 70%, ${primaryColor}40 0%, transparent 50%), radial-gradient(circle at 70% 30%, ${primaryColor}30 0%, transparent 50%)`
              : 'radial-gradient(circle at 30% 70%, hsl(var(--primary) / 0.4) 0%, transparent 50%)'
          }}
        />
        
        {/* Animated shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full blur-3xl opacity-20 animate-pulse" 
          style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }} 
        />
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full blur-3xl opacity-10 animate-pulse" 
          style={{ backgroundColor: primaryColor || 'hsl(var(--primary))', animationDelay: '1s' }} 
        />
        
        <div className="container mx-auto max-w-5xl text-center relative z-10 px-4">
          {logo && (
            <div className="mb-8 flex justify-center">
              <img 
                src={logo} 
                alt={companyName || 'Logo'} 
                className="h-16 md:h-20 w-auto object-contain filter brightness-0 invert"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}
          
          {companyName && !logo && (
            <p className="text-sm font-bold uppercase tracking-[0.3em] mb-6 text-background/60">
              {companyName}
            </p>
          )}
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 text-background leading-tight tracking-tight">
            {headline}
          </h1>
          
          <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto text-background/70 leading-relaxed">
            {subheadline}
          </p>
          
          <Button 
            size="lg" 
            className="bg-background text-foreground hover:bg-background/90 text-lg px-10 py-6 rounded-full font-semibold shadow-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {ctaText}
          </Button>
        </div>
      </section>
    );
  }

  // Corporate Classic style
  return (
    <section 
      className="relative py-32 px-4 overflow-hidden"
      style={{
        background: primaryColor 
          ? `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}05 50%, transparent 100%)`
          : 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--primary) / 0.05) 50%, transparent 100%)'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-1/3 h-full opacity-10"
        style={{
          background: primaryColor 
            ? `linear-gradient(180deg, ${primaryColor} 0%, transparent 100%)`
            : 'linear-gradient(180deg, hsl(var(--primary)) 0%, transparent 100%)'
        }}
      />
      
      <div className="container mx-auto max-w-4xl text-center relative z-10">
        {logo && (
          <div className="mb-8 flex justify-center">
            <img 
              src={logo} 
              alt={companyName || 'Logo'} 
              className="h-14 md:h-16 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}
        
        {companyName && !logo && (
          <p 
            className="text-sm font-semibold uppercase tracking-widest mb-4"
            style={{ color: primaryColor || 'hsl(var(--primary))' }}
          >
            {companyName}
          </p>
        )}
        
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground leading-tight">
          {headline}
        </h1>
        
        <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-muted-foreground leading-relaxed">
          {subheadline}
        </p>
        
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          style={{ 
            backgroundColor: primaryColor || 'hsl(var(--primary))',
            color: 'white'
          }}
        >
          {ctaText}
        </Button>
      </div>
    </section>
  );
}
