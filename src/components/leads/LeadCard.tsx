import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Star, 
  Plus,
  ExternalLink,
  Loader2,
  Check,
  Bookmark,
  Sparkles
} from 'lucide-react';
import type { ApifyLead } from '@/lib/api/apify';

interface LeadCardProps {
  lead: ApifyLead;
  index: number;
  isSaved?: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onSave?: () => void;
  onCreatePitch?: () => void;
  isSaving?: boolean;
  isCreatingPitch?: boolean;
}

export function LeadCard({
  lead,
  index,
  isSaved = false,
  isSelectable = false,
  isSelected = false,
  onSelect,
  onSave,
  onCreatePitch,
  isSaving = false,
  isCreatingPitch = false,
}: LeadCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24,
        delay: index * 0.06,
      }}
    >
      <Card className="group relative overflow-hidden hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1 transition-all duration-500">
        {/* Animated gradient border glow on hover */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary) / 0.08) 0%, transparent 50%, hsl(var(--primary) / 0.05) 100%)',
          }}
        />
        
        {/* Scan line animation on appear */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.6), transparent)' }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 1.2, delay: index * 0.06 + 0.3, ease: 'easeInOut' }}
        />

        <CardContent className="p-4 relative z-10">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start gap-3">
              {isSelectable && (
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={onSelect}
                  className="mt-1"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <motion.h3
                    className="font-medium text-foreground line-clamp-1"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.06 + 0.15, duration: 0.4 }}
                  >
                    {lead.business_name}
                  </motion.h3>
                  {isSaved && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    >
                      <Badge variant="secondary" className="shrink-0 text-xs bg-primary/10 text-primary">
                        <Check className="h-3 w-3 mr-1" />
                        Saved
                      </Badge>
                    </motion.div>
                  )}
                </div>
                {lead.category && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 + 0.2 }}
                  >
                    <Badge variant="outline" className="mt-1 text-xs">
                      {lead.category}
                    </Badge>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Contact Details - staggered reveal */}
            <motion.div
              className="space-y-1.5 text-sm text-muted-foreground"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.05, delayChildren: index * 0.06 + 0.25 } },
              }}
            >
              {lead.website_url && (
                <motion.div
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}
                >
                  <Globe className="h-3.5 w-3.5 flex-shrink-0 text-primary/60" />
                  <a 
                    href={lead.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="truncate hover:text-primary transition-colors"
                  >
                    {lead.website_url.replace(/^https?:\/\//, '').split('/')[0]}
                  </a>
                </motion.div>
              )}
              <motion.div
                className="flex items-center gap-2"
                variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}
              >
                <Mail className={`h-3.5 w-3.5 flex-shrink-0 ${lead.email ? 'text-green-500' : 'text-muted-foreground/40'}`} />
                {lead.email ? (
                  <span className="truncate">{lead.email}</span>
                ) : (
                  <span className="text-muted-foreground/40 italic text-xs">No email found</span>
                )}
              </motion.div>
              {lead.phone && (
                <motion.div
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}
                >
                  <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                  <span>{lead.phone}</span>
                </motion.div>
              )}
              {(lead.address || lead.city) && (
                <motion.div
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}
                >
                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">{lead.city || lead.address}</span>
                </motion.div>
              )}
              {lead.rating && (
                <motion.div
                  className="flex items-center gap-2"
                  variants={{ hidden: { opacity: 0, x: -6 }, visible: { opacity: 1, x: 0 } }}
                >
                  <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
                  <span>{lead.rating.toFixed(1)}</span>
                </motion.div>
              )}
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex gap-2 pt-2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 + 0.4, duration: 0.35 }}
            >
              {!isSaved && onSave && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSave}
                  disabled={isSaving}
                  className="group/save"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Bookmark className="h-4 w-4 group-hover/save:text-primary transition-colors" />
                  )}
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 group/pitch"
                onClick={onCreatePitch}
                disabled={!lead.website_url || isCreatingPitch}
              >
                {isCreatingPitch ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-1 group-hover/pitch:rotate-12 transition-transform" />
                )}
                Create Pitch
              </Button>
              {lead.google_maps_url && (
                <Button
                  size="sm"
                  variant="outline"
                  asChild
                >
                  <a 
                    href={lead.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
