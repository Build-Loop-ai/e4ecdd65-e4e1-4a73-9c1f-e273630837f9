import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Globe, Linkedin, Twitter, Instagram, Mail, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface CreatorProfile {
  full_name: string | null;
  avatar_url: string | null;
  business_name: string | null;
  tagline: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  public_email: string | null;
  show_branding: boolean;
}

interface CreatorFooterProps {
  userId: string;
  primaryColor?: string | null;
  clientLogo?: string | null;
  clientName?: string;
}

export function CreatorFooter({ userId, primaryColor, clientLogo, clientName }: CreatorFooterProps) {
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCreatorProfile();
  }, [userId]);

  const fetchCreatorProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      setProfile({
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        business_name: (data as any).business_name,
        tagline: (data as any).tagline,
        website_url: (data as any).website_url,
        linkedin_url: (data as any).linkedin_url,
        twitter_url: (data as any).twitter_url,
        instagram_url: (data as any).instagram_url,
        public_email: (data as any).public_email,
        show_branding: (data as any).show_branding ?? true,
      });
    }
    setLoading(false);
  };

  // Don't render if loading, no profile, or branding is hidden
  if (loading || !profile || !profile.show_branding) {
    return (
      <footer className="py-8 px-6 border-t border-border/50 bg-background">
        <div className="container mx-auto max-w-6xl flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Preview gegenereerd door Pitch
          </p>
          {clientLogo && (
            <img 
              src={clientLogo} 
              alt={clientName || 'Logo'} 
              className="h-8 w-auto object-contain opacity-50"
            />
          )}
        </div>
      </footer>
    );
  }

  const hasLinks = profile.website_url || profile.linkedin_url || profile.twitter_url || profile.instagram_url;
  const brandColor = primaryColor || '#3b82f6';

  const SocialLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2.5 rounded-full bg-white/10 text-white/80 hover:text-white transition-all"
      style={{ 
        backgroundColor: 'rgba(255,255,255,0.08)',
      }}
      whileHover={{ 
        scale: 1.1, 
        backgroundColor: brandColor + '40',
      }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <Icon className="h-5 w-5" />
    </motion.a>
  );

  return (
    <footer className="relative overflow-hidden">
      {/* Dark gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
        style={{
          backgroundImage: `radial-gradient(ellipse at top right, ${brandColor}15 0%, transparent 50%),
                           radial-gradient(ellipse at bottom left, ${brandColor}10 0%, transparent 50%)`
        }}
      />

      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative z-10 py-12 sm:py-16 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Creator Section */}
          <motion.div 
            className="flex flex-col lg:flex-row items-center gap-8 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-2 border-white/20 shadow-xl">
                <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                <AvatarFallback 
                  className="text-2xl font-bold text-white"
                  style={{ backgroundColor: brandColor + '60' }}
                >
                  {profile.full_name?.charAt(0) || profile.business_name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            {/* Info */}
            <div className="flex-1 text-center lg:text-left">
              <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-widest mb-2 font-medium">
                Created by
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {profile.full_name || 'Creative Professional'}
              </h3>
              {profile.business_name && (
                <p className="text-slate-300 font-medium">
                  {profile.business_name}
                </p>
              )}
              {profile.tagline && (
                <p className="text-slate-400 mt-2 max-w-lg text-sm sm:text-base leading-relaxed">
                  {profile.tagline}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col items-center gap-4">
              {/* Social Links */}
              {hasLinks && (
                <div className="flex items-center gap-2">
                  {profile.website_url && (
                    <SocialLink href={profile.website_url} icon={Globe} label="Website" />
                  )}
                  {profile.linkedin_url && (
                    <SocialLink href={profile.linkedin_url} icon={Linkedin} label="LinkedIn" />
                  )}
                  {profile.twitter_url && (
                    <SocialLink href={profile.twitter_url} icon={Twitter} label="Twitter" />
                  )}
                  {profile.instagram_url && (
                    <SocialLink href={profile.instagram_url} icon={Instagram} label="Instagram" />
                  )}
                </div>
              )}

              {/* Contact Button */}
              {profile.public_email && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    asChild
                    className="rounded-full px-6 py-5 font-semibold shadow-lg transition-all gap-2"
                    style={{
                      backgroundColor: brandColor,
                      color: '#fff',
                    }}
                  >
                    <a href={`mailto:${profile.public_email}`}>
                      <Mail className="h-4 w-4" />
                      Let's Work Together
                      <ExternalLink className="h-3 w-3 ml-1 opacity-60" />
                    </a>
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Divider */}
          <div 
            className="h-px w-full mb-8"
            style={{
              background: `linear-gradient(90deg, transparent, ${brandColor}30, transparent)`
            }}
          />

          {/* Bottom row */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>
              Preview gegenereerd door{' '}
              <span className="text-slate-400 font-medium">Pitch</span>
            </p>
            {clientLogo && (
              <img 
                src={clientLogo} 
                alt={clientName || 'Logo'} 
                className="h-6 w-auto object-contain opacity-40 hover:opacity-60 transition-opacity"
              />
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
