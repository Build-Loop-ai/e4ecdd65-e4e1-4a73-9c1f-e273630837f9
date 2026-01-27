import { useState } from 'react';
import { Eye, Users, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ViewsChart } from '@/components/dashboard/ViewsChart';
import { DeviceBreakdown } from '@/components/dashboard/DeviceBreakdown';
import { RecentVisitors } from '@/components/dashboard/RecentVisitors';
import { TopPreviews } from '@/components/dashboard/TopPreviews';
import { Button } from '@/components/ui/button';
import { useAnalytics, type DateRange } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

const dateRanges: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
];

interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subtext?: string;
}

function MetricCard({ icon: Icon, label, value, subtext }: MetricCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border bg-card">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const { 
    totalViews, 
    uniqueVisitors, 
    avgSessionDuration, 
    dailyStats, 
    deviceStats, 
    topPreviews, 
    recentVisits,
    isLoading 
  } = useAnalytics(dateRange);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track who's viewing your preview websites
            </p>
          </div>
          
          {/* Date range selector */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range.value)}
                className={cn(
                  "px-3 h-8 text-sm font-normal",
                  dateRange === range.value 
                    ? "bg-background shadow-sm text-foreground" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard
            icon={Eye}
            label={`Views · Last ${dateRange === '7d' ? '7' : dateRange === '14d' ? '14' : '30'} days`}
            value={totalViews.toLocaleString()}
          />
          <MetricCard
            icon={Users}
            label="Total visits"
            value={uniqueVisitors.toLocaleString()}
          />
          <MetricCard
            icon={Clock}
            label="Avg. session"
            value={formatDuration(avgSessionDuration)}
          />
        </div>

        {/* Views chart */}
        <ViewsChart data={dailyStats} loading={isLoading} />

        {/* Device breakdown and top previews */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DeviceBreakdown data={deviceStats} loading={isLoading} />
          <TopPreviews previews={topPreviews} loading={isLoading} />
        </div>

        {/* Recent visitors */}
        <RecentVisitors visits={recentVisits} loading={isLoading} />
      </div>
    </DashboardLayout>
  );
}
