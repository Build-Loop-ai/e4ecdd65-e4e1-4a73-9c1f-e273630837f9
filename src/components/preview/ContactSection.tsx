'use client';

import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight, Instagram, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getTemplateStyle, type TemplateId } from '@/lib/templateStyles';
import { getButtonTextColor } from '@/lib/colorContrast';
import { handlePreviewClick } from './HeroSection';

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
    // Don't render section if no contact info at all
    if (!hasContact && !hasSocial) {
      return null;
    }
    
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
    if (!hasContact && !hasSocial) return null;
    return (
      <section className="py-24 px-6 bg-white">
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
              We'd love to hear from you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-3xl p-5 sm:p-6 md:p-8 lg:p-12 shadow-xl shadow-orange-100/50 border border-orange-100"
          >
            <div className="flex flex-col gap-8">
              {/* Contact info */}
              <div className="space-y-3 sm:space-y-5">
                {email && (
                  <motion.a
                    href={`mailto:${email}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <Mail className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor || '#f97316' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-sm sm:text-base truncate">{email}</p>
                    </div>
                  </motion.a>
                )}

                {phone && (
                  <motion.a
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    whileHover={{ x: 5 }}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl hover:bg-orange-50 transition-colors"
                  >
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor || '#f97316' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-sm sm:text-base">{phone}</p>
                    </div>
                  </motion.a>
                )}

                {address && (
                  <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl">
                    <div 
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${primaryColor || '#f97316'}15` }}
                    >
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: primaryColor || '#f97316' }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground">Address</p>
                      <p className="font-medium text-sm sm:text-base break-words">{address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div 
                className="flex flex-col justify-center items-center text-center p-5 sm:p-8 rounded-2xl"
                style={{ backgroundColor: `${primaryColor || '#f97316'}10` }}
              >
                <p className="text-base sm:text-lg mb-4 sm:mb-6 font-medium">Ready to get started?</p>
                <Button 
                  size="lg"
                  onClick={handlePreviewClick}
                  className="rounded-full px-6 sm:px-8 py-5 sm:py-6 font-semibold shadow-lg transition-all hover:scale-105 text-sm sm:text-base"
                  style={{ 
                    backgroundColor: primaryColor || '#f97316',
                    color: getButtonTextColor(primaryColor || '#f97316')
                  }}
                >
                  Get in Touch
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
    if (!hasContact && !hasSocial) return null;
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
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6">
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
              onClick={handlePreviewClick}
              className="group text-lg px-14 py-8 rounded-xl font-bold transition-all hover:scale-105"
              style={{
                backgroundColor: primaryColor || '#3b82f6',
                color: getButtonTextColor(primaryColor || '#3b82f6'),
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
    // Don't render section if no contact info at all
    if (!hasContact && !hasSocial) {
      return null;
    }
    
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
                Let's{' '}
                <span style={{ color: primaryColor || '#3b82f6' }}>collaborate</span>
              </h2>
              <p className="text-lg text-white/60 mb-8 max-w-md">
                Ready to take your project to the next level? Get in touch today.
              </p>
              <Button 
                size="lg"
                onClick={handlePreviewClick}
                className="text-base px-8 py-6 rounded-xl font-semibold transition-all hover:scale-105"
                style={{
                  backgroundColor: primaryColor || '#3b82f6',
                  color: getButtonTextColor(primaryColor || '#3b82f6'),
                }}
              >
                Start a Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>

            {/* Right - Glass card - only show if there's contact info */}
            {hasContact && (
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
                      <Mail className="w-4 h-4" style={{ color: getButtonTextColor(primaryColor || '#3b82f6') }} />
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
                      <Phone className="w-4 h-4" style={{ color: getButtonTextColor(primaryColor || '#3b82f6') }} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Phone</p>
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
                      <MapPin className="w-4 h-4" style={{ color: getButtonTextColor(primaryColor || '#3b82f6') }} />
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">Location</p>
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
            )}
          </div>
        </div>
      </section>
    );
  }

  // Corporate Classic - guard against empty
  if (!hasContact && !hasSocial) return null;

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
              Get in Touch
            </h2>
            <p className="text-lg text-background/60 mb-10 max-w-md">
              Ready to work together? We'd love to hear from you.
            </p>
            <Button 
              size="lg"
              onClick={handlePreviewClick}
              className="text-base px-8 py-6 rounded-lg font-semibold"
              style={{
                backgroundColor: primaryColor || 'hsl(var(--primary))',
                color: getButtonTextColor(primaryColor || '#6366f1'),
              }}
            >
              Send a Message
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
                  <Mail className="w-5 h-5" style={{ color: getButtonTextColor(primaryColor || '#6366f1') }} />
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
                  <Phone className="w-5 h-5" style={{ color: getButtonTextColor(primaryColor || '#6366f1') }} />
                </div>
                <div>
                  <p className="text-background/50 text-sm">Phone</p>
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
                  <MapPin className="w-5 h-5" style={{ color: getButtonTextColor(primaryColor || '#6366f1') }} />
                </div>
                <div>
                  <p className="text-background/50 text-sm">Address</p>
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
