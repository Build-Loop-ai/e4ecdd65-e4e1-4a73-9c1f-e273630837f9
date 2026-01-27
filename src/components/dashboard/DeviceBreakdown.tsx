import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface DeviceBreakdownProps {
  data: Array<{ device_type: string; count: number }>;
  loading?: boolean;
}

const COLORS = {
  desktop: 'hsl(var(--chart-1))',
  mobile: 'hsl(var(--chart-2))',
  tablet: 'hsl(var(--chart-3))',
};

const ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet,
};

export function DeviceBreakdown({ data, loading }: DeviceBreakdownProps) {
  if (loading) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <Skeleton className="h-5 w-36 mb-6" />
        <Skeleton className="h-[180px] w-full" />
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);

  const formattedData = data.map(item => ({
    ...item,
    name: item.device_type.charAt(0).toUpperCase() + item.device_type.slice(1),
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  if (data.length === 0 || total === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-medium text-foreground mb-6">Device breakdown</h3>
        <div className="h-[180px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">No data yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-card">
      <h3 className="text-sm font-medium text-foreground mb-6">Device breakdown</h3>
      
      <div className="flex items-center gap-8">
        <div className="h-[140px] w-[140px] flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="count"
              >
                {formattedData.map((entry) => (
                  <Cell 
                    key={entry.device_type} 
                    fill={COLORS[entry.device_type as keyof typeof COLORS] || 'hsl(var(--muted))'} 
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
                formatter={(value: number, name: string) => [`${value} visits`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {formattedData.map((item) => {
            const Icon = ICONS[item.device_type as keyof typeof ICONS] || Monitor;
            return (
              <div key={item.device_type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: COLORS[item.device_type as keyof typeof COLORS] }}
                  />
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm text-foreground">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{item.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
