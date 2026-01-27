import { Eye, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  loading?: boolean;
}

function StatCard({ title, value, icon: Icon, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-8 w-20 mt-4" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}>
              <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatsCards() {
  const { totalPreviews, activePreviews, totalViews, weekViews, unreadFeedback, isLoading } = useDashboardStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Views"
        value={totalViews.toLocaleString()}
        icon={Eye}
        loading={isLoading}
      />
      <StatCard
        title="Views This Week"
        value={weekViews.toLocaleString()}
        icon={TrendingUp}
        loading={isLoading}
      />
      <StatCard
        title="Active Previews"
        value={`${activePreviews}/${totalPreviews}`}
        icon={FileText}
        loading={isLoading}
      />
      <StatCard
        title="Unread Feedback"
        value={unreadFeedback}
        icon={MessageSquare}
        loading={isLoading}
      />
    </div>
  );
}
