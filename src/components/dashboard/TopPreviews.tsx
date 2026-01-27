import { Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const maxViews = Math.max(...previews.map(p => p.views), 1);

  if (previews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Previews</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">No views yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Previews</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {previews.map((preview, index) => {
          const percentage = (preview.views / maxViews) * 100;
          
          return (
            <div key={preview.preview_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-4">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium text-foreground truncate max-w-[150px]">
                    {preview.client_name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {preview.views}
                  </span>
                </div>
              </div>
              <Progress value={percentage} className="h-2" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
