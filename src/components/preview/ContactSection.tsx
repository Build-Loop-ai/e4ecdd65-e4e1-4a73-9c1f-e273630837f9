import { Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactSectionProps {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  isModern?: boolean;
  primaryColor?: string;
}

export function ContactSection({
  email,
  phone,
  address,
  isModern = false,
  primaryColor,
}: ContactSectionProps) {
  const hasContact = email || phone || address;

  if (isModern) {
    return (
      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
            style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
          />
        </div>
        
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Neem Contact Op
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl mx-auto">
            Wij staan klaar om u te helpen. Neem vandaag nog contact met ons op.
          </p>
          
          {hasContact && (
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              {email && (
                <a 
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors duration-300 group"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <span className="text-foreground font-medium">{email}</span>
                </a>
              )}
              {phone && (
                <a 
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors duration-300 group"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  >
                    <Phone className="h-5 w-5" />
                  </div>
                  <span className="text-foreground font-medium">{phone}</span>
                </a>
              )}
              {address && (
                <div className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-muted/50">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                  >
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="text-foreground font-medium">{address}</span>
                </div>
              )}
            </div>
          )}
          
          <Button 
            size="lg"
            className="text-lg px-10 py-6 rounded-full font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
            style={{ 
              backgroundColor: primaryColor || 'hsl(var(--primary))',
              color: 'white'
            }}
          >
            Stuur een bericht
          </Button>
        </div>
      </section>
    );
  }

  // Corporate Classic style
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Neem Contact Op</h2>
        <div 
          className="w-16 h-1 mx-auto mb-8"
          style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
        />
        
        {hasContact && (
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            {email && (
              <a 
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-5 w-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                <span>{email}</span>
              </a>
            )}
            {phone && (
              <a 
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="h-5 w-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                <span>{phone}</span>
              </a>
            )}
            {address && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                <span>{address}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
