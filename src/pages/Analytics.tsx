import { useState } from 'react';
import { Eye, Users, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ViewsChart } from '@/components/dashboard/ViewsChart';
import { DeviceBreakdown } from '@/components/dashboard/DeviceBreakdown';
import { RecentVisitors } from '@/components/dashboard/RecentVisitors';
import { TopPreviews } from '@/components/dashboard/TopPreviews';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAnalytics, type DateRange } from '@/hooks/useAnalytics';
import { cn } from '@/lib/utils';

const dateRanges: { value: DateRange; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
];

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subtext 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string | number; 
  subtext?: string;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
            {subtext && <p className="text-xs text-muted-foreground/70">{subtext}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Track who's viewing your preview websites
            </p>
          </div>
          
          {/* Date range selector */}
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            {dateRanges.map((range) => (
              <Button
                key={range.value}
                variant="ghost"
                size="sm"
                onClick={() => setDateRange(range.value)}
                className={cn(
                  "px-4",
                  dateRange === range.value && "bg-background shadow-sm"
                )}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={Eye}
            label="Total Views"
            value={totalViews.toLocaleString()}
            subtext={`Last ${dateRange === '7d' ? '7' : dateRange === '14d' ? '14' : '30'} days`}
          />
          <StatCard
            icon={Users}
            label="Total Visits"
            value={uniqueVisitors.toLocaleString()}
          />
          <StatCard
            icon={Clock}
            label="Avg. Session"
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
