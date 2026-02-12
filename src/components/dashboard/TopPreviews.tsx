import { Eye, TrendingUp } from 'lucide-react';
import { GlowIcon } from '@/components/ui/GlowIcon';
import { Skeleton } from '@/components/ui/skeleton';

interface TopPreview {
  preview_id: string;
  client_name: string;
  views: number;
}

interface TopPreviewsProps {
  previews: TopPreview[];
  loading?: boolean;
}

export function TopPreviews({ previews, loading }: TopPreviewsProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-28 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const maxViews = Math.max(...previews.map(p => p.views), 1);

  if (previews.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-6">Top previews</h3>
        <div className="py-12 text-center">
          <div className="mx-auto mb-3 w-fit"><GlowIcon icon={TrendingUp} variant="muted" size="lg" /></div>
          <p className="text-muted-foreground text-sm">No views yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-medium text-foreground mb-6">Top previews</h3>
      
      <div className="space-y-4">
        {previews.map((preview, index) => {
          const percentage = (preview.views / maxViews) * 100;
          
          return (
            <div key={preview.preview_id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-muted-foreground w-4 flex-shrink-0">{index + 1}.</span>
                  <span className="font-medium text-foreground truncate">{preview.client_name}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
                  <Eye className="h-3 w-3" />
                  <span>{preview.views}</span>
                </div>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
