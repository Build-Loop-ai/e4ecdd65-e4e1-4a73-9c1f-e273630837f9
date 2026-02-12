import { Eye, FileText, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowIcon } from '@/components/ui/GlowIcon';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  trend?: number;
  loading?: boolean;
  description?: string;
}

function StatCard({ title, value, icon, trend, loading, description }: StatCardProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <Skeleton className="h-5 w-12" />
        </div>
        <Skeleton className="h-8 w-24 mb-1" />
        <Skeleton className="h-4 w-20" />
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <GlowIcon icon={icon} size="md" />
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-full",
            trend >= 0 
              ? "text-primary bg-primary/10" 
              : "text-muted-foreground bg-muted"
          )}>
            {trend >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-0.5">{description}</p>
      )}
    </div>
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
        description="All time"
      />
      <StatCard
        title="This Week"
        value={weekViews.toLocaleString()}
        icon={TrendingUp}
        loading={isLoading}
        description="Last 7 days"
      />
      <StatCard
        title="Active Previews"
        value={`${activePreviews} / ${totalPreviews}`}
        icon={FileText}
        loading={isLoading}
        description="Sent to clients"
      />
      <StatCard
        title="Unread Feedback"
        value={unreadFeedback}
        icon={MessageSquare}
        loading={isLoading}
        description="Awaiting review"
      />
    </div>
  );
}
