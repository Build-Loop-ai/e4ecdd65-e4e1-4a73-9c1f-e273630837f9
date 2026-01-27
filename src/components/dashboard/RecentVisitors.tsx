import { formatDistanceToNow } from 'date-fns';
import { Globe, Monitor, Smartphone, Tablet, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (visits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Visitors</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Globe className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No visitors yet</p>
            <p className="text-muted-foreground/70 text-xs mt-1">
              Share your preview links to start tracking visitors
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Visitors</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {visits.map((visit) => {
            const DeviceIcon = deviceIcons[visit.device_type as keyof typeof deviceIcons] || Monitor;
            const location = [visit.city, visit.country].filter(Boolean).join(', ') || 'Unknown location';
            
            return (
              <div 
                key={visit.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                {/* Device icon */}
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DeviceIcon className="h-5 w-5 text-primary" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm text-foreground truncate">
                      {visit.client_name}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      {visit.device_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground truncate">
                      {location}
                    </p>
                  </div>
                </div>
                
                {/* Time */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(visit.visited_at), { addSuffix: true })}
                  </p>
                  {visit.referrer && (
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground truncate max-w-[100px]">
                        {new URL(visit.referrer).hostname}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
