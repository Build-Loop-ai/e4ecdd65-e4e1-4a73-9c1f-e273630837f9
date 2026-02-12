import { Eye, FileText, MessageSquare, TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Mail } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GlowIcon } from '@/components/ui/GlowIcon';
import { useDashboardStats } from '@/hooks/useAnalytics';
import { useSubscription, PLAN_LIMITS } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

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
    <div className="p-6 rounded-xl border border-border bg-card hover:shadow-elevated hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
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

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const pct = limit === -1 ? 0 : Math.min(100, (used / limit) * 100);
  const display = limit === -1 ? `${used} / ∞` : `${used} / ${limit}`;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", pct >= 90 ? "text-destructive" : "text-foreground")}>{display}</span>
      </div>
      {limit !== -1 && <Progress value={pct} className="h-1.5" />}
    </div>
  );
}

export function StatsCards() {
  const { totalPreviews, activePreviews, totalViews, weekViews, unreadFeedback, isLoading } = useDashboardStats();
  const { subscription, isLoading: subLoading } = useSubscription();
  const limits = PLAN_LIMITS[subscription.plan];

  return (
    <div className="space-y-4">
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

      {/* Usage indicators */}
      {!subLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <GlowIcon icon={Zap} size="sm" />
              <span className="text-sm font-medium text-foreground">Pitches Used</span>
            </div>
            <UsageBar used={subscription.pitches_used} limit={limits.pitches} label="This month" />
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-3">
              <GlowIcon icon={Mail} size="sm" />
              <span className="text-sm font-medium text-foreground">Emails Sent</span>
            </div>
            <UsageBar used={subscription.emails_used} limit={limits.emails} label="This month" />
          </div>
        </div>
      )}
    </div>
  );
}
