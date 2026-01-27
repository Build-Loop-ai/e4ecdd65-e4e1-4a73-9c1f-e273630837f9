'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';

interface ContactSectionProps {
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  isModern?: boolean;
  primaryColor?: string;
  templateId?: TemplateId;
}

export function ContactSection({
  email,
  phone,
  address,
  instagram,
  facebook,
  isModern = false,
  primaryColor,
  templateId,
}: ContactSectionProps) {
  const hasContact = email || phone || address;
  const hasSocial = instagram || facebook;
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  // Elegant Minimal variant
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section className="py-40 px-6 bg-background">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 
              className="text-3xl md:text-4xl font-light mb-6"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              Laten we praten
            </h2>
            <div 
              className="w-16 h-px mx-auto mb-10"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            {email && (
              <a 
                href={`mailto:${email}`}
                className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {email}
              </a>
            )}
            {phone && (
              <a 
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="block text-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {phone}
              </a>
            )}
            {address && (
              <p className="text-lg text-muted-foreground">
                {address}
              </p>
            )}
          </motion.div>

          {hasSocial && (
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center gap-6 mt-12"
            >
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
            </motion.div>
          )}
        </div>
      </section>
    );
  }

  // Warm Friendly variant
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-background to-orange-50/50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kom langs of neem contact op!
            </h2>
            <p className="text-muted-foreground text-lg">
              We staan altijd klaar om je te helpen
            </p>
          </motion.div>

          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-orange-100/30 border border-orange-100">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact info */}
              <div className="space-y-6">
                {email && (
                  <motion.a
                    href={`mailto:${email}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors group"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}15` }}
                    >
                      <Mail className="w-5 h-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">E-mail</p>
                      <p className="font-medium">{email}</p>
                    </div>
                  </motion.a>
                )}

                {phone && (
                  <motion.a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors group"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}15` }}
                    >
                      <Phone className="w-5 h-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefoon</p>
                      <p className="font-medium">{phone}</p>
                    </div>
                  </motion.a>
                )}

                {address && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}15` }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: primaryColor || 'hsl(var(--primary))' }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adres</p>
                      <p className="font-medium">{address}</p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="flex flex-col justify-center items-center text-center p-8 rounded-2xl"
                style={{ backgroundColor: `${primaryColor || 'hsl(var(--primary))'}10` }}
              >
                <p className="text-lg mb-6">Klaar om te beginnen?</p>
                <Button 
                  size="lg"
                  className="rounded-full px-8 py-6 font-semibold shadow-lg"
                  style={{ 
                    backgroundColor: primaryColor || 'hsl(var(--primary))',
                    color: 'white'
                  }}
                >
                  Neem contact op
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {hasSocial && (
                  <div className="flex gap-4 mt-8">
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Instagram className="w-5 h-5 text-foreground" />
                      </a>
                    )}
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-white shadow flex items-center justify-center hover:scale-110 transition-transform"
                      >
                        <Facebook className="w-5 h-5 text-foreground" />
                      </a>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Bold Starter variant
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section className="py-32 px-6 bg-black relative overflow-hidden">
        {/* Animated gradient background */}
        <motion.div 
          animate={{ 
            background: [
              `radial-gradient(circle at 0% 0%, ${primaryColor || '#3b82f6'}40 0%, transparent 50%)`,
              `radial-gradient(circle at 100% 100%, ${primaryColor || '#3b82f6'}40 0%, transparent 50%)`,
              `radial-gradient(circle at 0% 0%, ${primaryColor || '#3b82f6'}40 0%, transparent 50%)`,
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute inset-0"
        />

        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - CTA */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-6"
                style={{ 
                  background: `linear-gradient(135deg, white 0%, ${primaryColor || '#3b82f6'} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Let's Build Something Amazing
              </h2>
              <p className="text-xl text-white/60 mb-10">
                Ready to take your business to the next level? Get in touch.
              </p>

              <Button 
                size="lg"
                className="group text-lg px-10 py-8 rounded-2xl font-bold"
                style={{
                  backgroundColor: primaryColor || '#3b82f6',
                  color: 'white',
                  boxShadow: `0 20px 60px -15px ${primaryColor || '#3b82f6'}80`,
                }}
              >
                Start a Conversation
                <ArrowRight className="ml-2 h-6 w-6 transition-transform duration-300 group-hover:translate-x-2" />
              </Button>
            </motion.div>

            {/* Right - Contact details */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-4"
            >
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="block p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Email</p>
                      <p className="text-white font-medium">{email}</p>
                    </div>
                  </div>
                </a>
              )}

              {phone && (
                <a
                  href={`tel:${phone.replace(/\s/g, '')}`}
                  className="block p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Phone</p>
                      <p className="text-white font-medium">{phone}</p>
                    </div>
                  </div>
                </a>
              )}

              {address && (
                <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Location</p>
                      <p className="text-white font-medium">{address}</p>
                    </div>
                  </div>
                </div>
              )}

              {hasSocial && (
                <div className="flex gap-3 pt-4">
                  {instagram && (
                    <a
                      href={instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Instagram className="w-5 h-5 text-white" />
                    </a>
                  )}
                  {facebook && (
                    <a
                      href={facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                    >
                      <Facebook className="w-5 h-5 text-white" />
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // Default: Modern Professional / Corporate Classic
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
              className="group text-lg px-8 py-7 rounded-full font-semibold shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: primaryColor || 'hsl(var(--background))',
                color: primaryColor ? 'white' : 'hsl(var(--foreground))',
              }}
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
