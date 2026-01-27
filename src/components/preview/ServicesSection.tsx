interface Service {
  title: string;
  description: string;
}

interface ServicesSectionProps {
  services: Service[];
  isModern?: boolean;
  primaryColor?: string;
}

export function ServicesSection({
  services,
  isModern = false,
  primaryColor,
}: ServicesSectionProps) {
  if (services.length === 0) return null;

  if (isModern) {
    return (
      <section className="py-24 px-4 bg-foreground text-background">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Onze Diensten
            </h2>
            <p className="text-background/60 text-lg">
              Wat wij voor u kunnen betekenen
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="group relative p-8 rounded-3xl bg-background/5 border border-background/10 hover:bg-background/10 transition-all duration-500 overflow-hidden"
              >
                {/* Hover gradient */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: primaryColor 
                      ? `linear-gradient(135deg, ${primaryColor}20 0%, transparent 100%)`
                      : 'linear-gradient(135deg, hsl(var(--primary) / 0.2) 0%, transparent 100%)'
                  }}
                />
                
                <div className="relative z-10">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-xl"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-background">
                    {service.title}
                  </h3>
                  <p className="text-background/70 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Corporate Classic style
  return (
    <section 
      className="py-20 px-4"
      style={{
        background: primaryColor 
          ? `linear-gradient(180deg, ${primaryColor}08 0%, transparent 100%)`
          : 'linear-gradient(180deg, hsl(var(--muted)) 0%, transparent 100%)'
      }}
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Onze Diensten</h2>
          <div 
            className="w-16 h-1 mx-auto"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="bg-background p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border/50"
            >
              <div className="flex items-start gap-4">
                <div 
                  className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
