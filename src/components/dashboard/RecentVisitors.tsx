import { formatDistanceToNow } from 'date-fns';
import { Globe, Monitor, Smartphone, Tablet } from 'lucide-react';
import { GlowIcon } from '@/components/ui/GlowIcon';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Visit {
  id: string;
  preview_id: string;
  visited_at: string;
  device_type: string;
  country: string | null;
  city: string | null;
  referrer: string | null;
  client_name: string;
}

interface RecentVisitorsProps {
  visits: Visit[];
  loading?: boolean;
}

const deviceIcons = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function RecentVisitors({ visits, loading }: RecentVisitorsProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-6">Recent visitors</h3>
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 w-fit"><GlowIcon icon={Globe} variant="muted" size="lg" /></div>
          <p className="text-muted-foreground text-sm">No visitors yet</p>
          <p className="text-muted-foreground/60 text-xs mt-1">
            Share your preview links to start tracking
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-medium text-foreground mb-6">Recent visitors</h3>
      
      <div className="space-y-1">
        {visits.map((visit) => {
          const DeviceIcon = deviceIcons[visit.device_type as keyof typeof deviceIcons] || Monitor;
          const location = [visit.city, visit.country].filter(Boolean).join(', ') || 'Unknown';
          
          return (
            <div 
              key={visit.id}
              className="flex items-center gap-4 p-3 -mx-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Device icon */}
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-muted-foreground/15 to-muted-foreground/5 flex items-center justify-center flex-shrink-0 shadow-sm">
                <DeviceIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {visit.client_name}
                  </p>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                    {visit.device_type}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {location}
                </p>
              </div>
              
              {/* Time */}
              <p className="text-xs text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(visit.visited_at), { addSuffix: true })}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
