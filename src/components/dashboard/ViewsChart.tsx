import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { format, parseISO } from 'date-fns';

interface ViewsChartProps {
  data: Array<{ date: string; views: number }>;
  loading?: boolean;
}

export function ViewsChart({ data, loading }: ViewsChartProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-[280px] w-full" />
      </div>
    );
  }

  const formattedData = data.map(item => ({
    ...item,
    displayDate: format(parseISO(item.date), 'MMM d'),
  }));

  const hasData = data.some(item => item.views > 0);

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-medium text-foreground mb-6">Views over time</h3>
      
      {!hasData ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">No views yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Share your preview links to start tracking</p>
          </div>
        </div>
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false}
                stroke="hsl(var(--border))"
              />
              <XAxis 
                dataKey="displayDate" 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                dx={-10}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  padding: '8px 12px',
                }}
                labelStyle={{ 
                  color: 'hsl(var(--foreground))',
                  fontWeight: 500,
                  marginBottom: '4px',
                }}
                itemStyle={{
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: '13px',
                }}
                formatter={(value: number) => [value, 'Views']}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorViews)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
