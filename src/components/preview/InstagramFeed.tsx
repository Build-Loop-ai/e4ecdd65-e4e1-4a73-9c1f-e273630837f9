'use client';

import { motion } from 'framer-motion';
import { Instagram } from 'lucide-react';

interface InstagramPost {
  image: string;
  caption?: string | null;
  link: string;
}

interface InstagramFeedProps {
  handle?: string;
  posts: InstagramPost[];
  primaryColor?: string;
}

export function InstagramFeed({
  handle,
  posts,
  primaryColor,
}: InstagramFeedProps) {
  // Filter for valid posts with working image URLs
  const validPosts = posts?.filter(post => 
    post.image && 
    post.image.startsWith('http') &&
    !post.image.includes('placeholder') &&
    !post.image.includes('default')
  ).slice(0, 8) || [];

  // Require minimum 3 valid posts to show Instagram section
  if (validPosts.length < 3) return null;

  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-between mb-12"
        >
          <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(135deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
              }}
            >
              <Instagram className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">Instagram</h2>
              {handle && (
                <a 
                  href={`https://instagram.com/${handle.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  @{handle.replace('@', '')}
                </a>
              )}
            </div>
          </div>
          
          {handle && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://instagram.com/${handle.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-colors"
              style={{ 
                backgroundColor: primaryColor || 'hsl(var(--primary))',
                color: 'white'
              }}
            >
              Volg ons
            </motion.a>
          )}
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {validPosts.map((post, index) => (
            <motion.a
              key={index}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.03 }}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <img 
                src={post.image}
                alt={post.caption || `Instagram post ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => { e.currentTarget.parentElement!.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <Instagram className="w-8 h-8 text-white" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
