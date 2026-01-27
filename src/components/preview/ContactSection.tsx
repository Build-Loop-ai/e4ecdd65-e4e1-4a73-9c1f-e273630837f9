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
  title?: string;
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
  title = 'Contact',
  isModern = false,
  primaryColor,
  templateId,
}: ContactSectionProps) {
  const hasContact = email || phone || address;
  const hasSocial = instagram || facebook;
  const template = getTemplateStyle(templateId);
  const effectiveTemplateId = templateId || (isModern ? 'modern-professional' : 'corporate-classic');

  // ========== ELEGANT MINIMAL - Centered text only, no cards ==========
  if (effectiveTemplateId === 'elegant-minimal') {
    return (
      <section className="py-40 px-6 bg-background">
        <div className="container mx-auto max-w-xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <h2 
              className="text-3xl md:text-4xl font-light mb-8"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title}
            </h2>
            <motion.div 
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.3 }}
              className="w-16 h-px mx-auto mb-12 origin-center"
              style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-4"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            {email && (
              <a 
                href={`mailto:${email}`}
                className="block text-lg text-muted-foreground hover:text-foreground transition-colors duration-500"
              >
                {email}
              </a>
            )}
            {phone && (
              <a 
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="block text-lg text-muted-foreground hover:text-foreground transition-colors duration-500"
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
              transition={{ duration: 1, delay: 0.8 }}
              className="flex justify-center gap-8 mt-16"
            >
              {instagram && (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-500"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {facebook && (
                <a
                  href={facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors duration-500"
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

  // ========== WARM FRIENDLY - Rounded card with warm shadows ==========
  if (effectiveTemplateId === 'warm-friendly') {
    return (
      <section className="py-24 px-6 bg-gradient-to-b from-background to-orange-50/50">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: 'spring' }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {title} 👋
            </h2>
            <p className="text-muted-foreground text-lg">
              We helpen je graag verder
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-orange-100/50 border border-orange-100"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Contact info */}
              <div className="space-y-5">
                {email && (
                  <motion.a
                    href={`mailto:${email}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <Mail className="w-5 h-5" style={{ color: primaryColor || '#f97316' }} />
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
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <Phone className="w-5 h-5" style={{ color: primaryColor || '#f97316' }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Telefoon</p>
                      <p className="font-medium">{phone}</p>
                    </div>
                  </motion.a>
                )}

                {address && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <MapPin className="w-5 h-5" style={{ color: primaryColor || '#f97316' }} />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adres</p>
                      <p className="font-medium">{address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div 
                className="flex flex-col justify-center items-center text-center p-8 rounded-2xl"
                style={{ backgroundColor: `${primaryColor || '#f97316'}10` }}
              >
                <p className="text-lg mb-6 font-medium">Klaar om te beginnen?</p>
                <Button 
                  size="lg"
                  className="rounded-full px-8 py-6 font-semibold shadow-lg transition-all hover:scale-105"
                  style={{ 
                    backgroundColor: primaryColor || '#f97316',
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
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // ========== BOLD STARTER - Minimal with neon glow CTA ==========
  if (effectiveTemplateId === 'bold-starter') {
    return (
      <section className="py-32 px-6 bg-[#0a0a0a] relative overflow-hidden">
        {/* Subtle glow */}
        <motion.div 
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px]"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />

        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6">
              Let's Talk
            </h2>
            <p className="text-xl text-white/50 max-w-lg mx-auto mb-12">
              Ready to start your project? Get in touch.
            </p>
          </motion.div>

          {/* Neon glow CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Button 
              size="lg"
              className="group text-lg px-14 py-8 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: 'white',
                boxShadow: `0 0 80px -20px ${primaryColor || '#3b82f6'}, 0 0 40px -10px ${primaryColor || '#3b82f6'}`,
              }}
            >
              Start Conversation
              <ArrowRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Button>
          </motion.div>

          {/* Contact links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mt-16"
          >
            {email && (
              <a href={`mailto:${email}`} className="text-white/50 hover:text-white transition-colors">
                {email}
              </a>
            )}
            {phone && (
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-white/50 hover:text-white transition-colors">
                {phone}
              </a>
            )}
          </motion.div>

          {hasSocial && (
            <div className="flex justify-center gap-4 mt-8">
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
        </div>
      </section>
    );
  }

  // ========== MODERN PROFESSIONAL - Glassmorphism floating card ==========
  if (effectiveTemplateId === 'modern-professional') {
    return (
      <section className="py-32 px-6 bg-[#0a0a0a] relative overflow-hidden">
        {/* Background gradients */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20"
          style={{ backgroundColor: primaryColor || '#3b82f6' }}
        />

        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - CTA */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Laten we{' '}
                <span style={{ color: primaryColor || '#3b82f6' }}>samenwerken</span>
              </h2>
              <p className="text-lg text-white/60 mb-8 max-w-md">
                Klaar om uw project naar het volgende niveau te tillen? Neem vandaag nog contact op.
              </p>
              <Button 
                size="lg"
                className="text-base px-8 py-6 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: primaryColor || '#3b82f6',
                  color: 'white',
                }}
              >
                Start een gesprek
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Right - Glass card */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Animated border */}
              <div 
                className="absolute -inset-px rounded-3xl opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor || '#3b82f6'}, transparent, ${primaryColor || '#3b82f6'})`,
                }}
              />
              
              <div className="relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 space-y-4">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Email</p>
                      <p className="text-white font-medium">{email}</p>
                    </div>
                  </a>
                )}

                {phone && (
                  <a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Telefoon</p>
                      <p className="text-white font-medium">{phone}</p>
                    </div>
                  </a>
                )}

                {address && (
                  <div className="flex items-center gap-4 p-4 rounded-xl">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor || '#3b82f6' }}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Locatie</p>
                      <p className="text-white font-medium">{address}</p>
                    </div>
                  </div>
                )}

                {hasSocial && (
                  <div className="flex gap-3 pt-4 pl-4">
                    {instagram && (
                      <a
                        href={instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Instagram className="w-4 h-4 text-white" />
                      </a>
                    )}
                    {facebook && (
                      <a
                        href={facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                      >
                        <Facebook className="w-4 h-4 text-white" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    );
  }

  // ========== CORPORATE CLASSIC - Two-column layout ==========
  return (
    <section className="py-32 px-6 bg-foreground text-background">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left - CTA */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Neem contact op
            </h2>
            <p className="text-lg text-background/60 mb-10 max-w-md">
              Klaar om samen te werken? We horen graag van u.
            </p>
            <Button 
              size="lg"
              className="text-base px-8 py-6 rounded-lg font-semibold"
              style={{
                backgroundColor: primaryColor || 'hsl(var(--primary))',
                color: 'white',
              }}
            >
              Stuur een bericht
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>

          {/* Right - Contact details */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {email && (
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-4 p-5 rounded-xl bg-background/5 hover:bg-background/10 transition-colors group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-background/50 text-sm">Email</p>
                  <p className="text-background font-medium">{email}</p>
                </div>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone.replace(/\s/g, '')}`}
                className="flex items-center gap-4 p-5 rounded-xl bg-background/5 hover:bg-background/10 transition-colors group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-background/50 text-sm">Telefoon</p>
                  <p className="text-background font-medium">{phone}</p>
                </div>
              </a>
            )}

            {address && (
              <div className="flex items-center gap-4 p-5 rounded-xl bg-background/5">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor || 'hsl(var(--primary))' }}
                >
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-background/50 text-sm">Adres</p>
                  <p className="text-background font-medium">{address}</p>
                </div>
              </div>
            )}

            {hasSocial && (
              <div className="flex gap-4 pt-4">
                {instagram && (
                  <a
                    href={instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <Instagram className="w-5 h-5 text-background" />
                  </a>
                )}
                {facebook && (
                  <a
                    href={facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
                  >
                    <Facebook className="w-5 h-5 text-background" />
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
