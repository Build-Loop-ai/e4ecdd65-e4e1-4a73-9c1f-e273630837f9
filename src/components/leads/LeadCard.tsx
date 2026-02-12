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
  Bookmark
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
    <Card className="hover:shadow-elevated hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header with optional checkbox and saved badge */}
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
                <h3 className="font-medium text-foreground line-clamp-1">
                  {lead.business_name}
                </h3>
                {isSaved && (
                  <Badge variant="secondary" className="shrink-0 text-xs bg-primary/10 text-primary">
                    <Check className="h-3 w-3 mr-1" />
                    Saved
                  </Badge>
                )}
              </div>
              {lead.category && (
                <Badge variant="outline" className="mt-1 text-xs">
                  {lead.category}
                </Badge>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-1.5 text-sm text-muted-foreground">
            {lead.website_url && (
              <div className="flex items-center gap-2">
                <Globe className="h-3.5 w-3.5 flex-shrink-0" />
                <a 
                  href={lead.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="truncate hover:text-primary"
                >
                  {lead.website_url.replace(/^https?:\/\//, '').split('/')[0]}
                </a>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Mail className={`h-3.5 w-3.5 flex-shrink-0 ${lead.email ? 'text-green-500' : 'text-muted-foreground/40'}`} />
              {lead.email ? (
                <span className="truncate">{lead.email}</span>
              ) : (
                <span className="text-muted-foreground/40 italic text-xs">No email found</span>
              )}
            </div>
            {lead.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{lead.phone}</span>
              </div>
            )}
            {(lead.address || lead.city) && (
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">
                  {lead.city || lead.address}
                </span>
              </div>
            )}
            {lead.rating && (
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-400 text-amber-400" />
                <span>{lead.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {!isSaved && onSave && (
              <Button
                size="sm"
                variant="outline"
                onClick={onSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            )}
            <Button
              size="sm"
              className="flex-1"
              onClick={onCreatePitch}
              disabled={!lead.website_url || isCreatingPitch}
            >
              {isCreatingPitch ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-1" />
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
