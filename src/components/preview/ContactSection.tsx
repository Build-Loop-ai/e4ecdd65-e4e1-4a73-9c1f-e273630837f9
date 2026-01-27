'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactSectionProps {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  isModern?: boolean;
  primaryColor?: string;
}

export function ContactSection({
  email,
  phone,
  address,
  instagram,
  facebook,
  isModern = false,
  primaryColor,
}: ContactSectionProps) {
  const hasContact = email || phone || address;
  const hasSocial = instagram || facebook;

  return (
    <section className="relative py-32 px-6 bg-foreground text-background overflow-hidden">
      {/* Background decoration */}
      <div 
        className="absolute top-0 left-0 w-full h-px opacity-20"
        style={{ backgroundColor: primaryColor || 'white' }}
      />
      <motion.div 
        className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full blur-[150px] opacity-10"
        style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.15, 0.1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - CTA */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6">
              Laten we 
              <span 
                className="block"
                style={{ color: primaryColor || 'hsl(var(--primary))' }}
              >
                samenwerken
              </span>
            </h2>
            <p className="text-xl text-background/60 mb-10 max-w-md">
              Klaar om uw visie werkelijkheid te maken? Neem vandaag nog contact met ons op.
            </p>

            <Button 
              size="lg"
              className="group text-lg px-8 py-7 rounded-full font-semibold bg-background text-foreground hover:bg-background/90 shadow-2xl transition-all duration-300"
            >
              Start een gesprek
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </motion.div>

          {/* Right column - Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {email && (
              <motion.a
                href={`mailto:${email}`}
                whileHover={{ x: 10 }}
                className="flex items-center gap-5 p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors duration-300 group"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-background/50 mb-1">E-mail</p>
                  <p className="text-lg font-medium text-background">{email}</p>
                </div>
              </motion.a>
            )}

            {phone && (
              <motion.a
                href={`tel:${phone.replace(/\s/g, '')}`}
                whileHover={{ x: 10 }}
                className="flex items-center gap-5 p-6 rounded-2xl bg-background/5 border border-background/10 hover:bg-background/10 transition-colors duration-300 group"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-background/50 mb-1">Telefoon</p>
                  <p className="text-lg font-medium text-background">{phone}</p>
                </div>
              </motion.a>
            )}

            {address && (
              <motion.div
                whileHover={{ x: 10 }}
                className="flex items-center gap-5 p-6 rounded-2xl bg-background/5 border border-background/10"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-background/50 mb-1">Adres</p>
                  <p className="text-lg font-medium text-background">{address}</p>
                </div>
              </motion.div>
            )}

            {/* Social links */}
            {hasSocial && (
              <div className="flex gap-4 pt-4">
                {instagram && (
                  <motion.a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-xl bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <Instagram className="w-6 h-6 text-background" />
                  </motion.a>
                )}
                {facebook && (
                  <motion.a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-14 h-14 rounded-xl bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <Facebook className="w-6 h-6 text-background" />
                  </motion.a>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
