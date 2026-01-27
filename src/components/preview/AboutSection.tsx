interface AboutSectionProps {
  title: string;
  description: string;
  valueProps?: string[];
  isModern?: boolean;
  primaryColor?: string;
}

export function AboutSection({
  title,
  description,
  valueProps = [],
  isModern = false,
  primaryColor,
}: AboutSectionProps) {
  if (isModern) {
    return (
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Decorative line */}
        <div 
          className="absolute left-0 top-1/2 w-1 h-32 -translate-y-1/2"
          style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
        />
        
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                {title}
              </h2>
              <div 
                className="w-20 h-1 mb-8"
                style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
              />
              <p className="text-lg text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
            
            {valueProps.length > 0 && (
              <div className="space-y-6">
                {valueProps.map((prop, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-4 p-6 rounded-2xl bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors duration-300"
                  >
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                    >
                      {index + 1}
                    </div>
                    <p className="text-foreground font-medium pt-2">{prop}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Corporate Classic style
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
          <div 
            className="w-16 h-1 mx-auto mb-6"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
        
        {valueProps.length > 0 && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {valueProps.map((prop, index) => (
              <div 
                key={index} 
                className="text-center p-8 rounded-xl bg-gradient-to-b from-muted/50 to-transparent border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  {index + 1}
                </div>
                <p className="font-medium text-foreground">{prop}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
