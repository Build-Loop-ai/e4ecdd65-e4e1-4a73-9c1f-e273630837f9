import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Flame, 
  Pause, 
  Play, 
  FlaskConical, 
  ChevronRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Thermometer,
  Mail
} from 'lucide-react';
import { WarmyConnection } from '@/hooks/useWarmyStatus';
import { TemperatureGauge } from './TemperatureGauge';
import { SendingCapacityBar } from './SendingCapacityBar';
import { cn } from '@/lib/utils';

interface WarmyStatusCardProps {
  connection: WarmyConnection;
  onPause: (id: string) => Promise<boolean>;
  onResume: (id: string) => Promise<boolean>;
  onRunTest: (id: string) => Promise<any>;
  onViewDetails: (connection: WarmyConnection) => void;
}

export function WarmyStatusCard({ 
  connection, 
  onPause, 
  onResume, 
  onRunTest,
  onViewDetails 
}: WarmyStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // Warmy may reject pause/resume when warmup hasn't started yet.
  // We treat "warmup_started_at" as a signal that the mailbox is actually warming.
  const warmupStarted = Boolean(connection.warmup_started_at);
  const canPause = warmupStarted && connection.warmy_state !== 'paused';
  const canResume = warmupStarted && connection.warmy_state === 'paused';

  const handlePause = async () => {
    setIsActionLoading('pause');
    await onPause(connection.id);
    setIsActionLoading(null);
  };

  const handleResume = async () => {
    setIsActionLoading('resume');
    await onResume(connection.id);
    setIsActionLoading(null);
  };

  const handleTest = async () => {
    setIsActionLoading('test');
    await onRunTest(connection.id);
    setIsActionLoading(null);
  };

  const getStatusBadge = () => {
    const temp = connection.warmy_temperature || 0;
    const score = connection.deliverability_score || 0;
    
    if (connection.warmy_state === 'paused') {
      return (
        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
          <Pause className="h-3 w-3 mr-1" />
          Paused
        </Badge>
      );
    }
    
    if (temp >= 90 && score >= 80) {
      return (
        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    }
    
    if (score < 70) {
      return (
        <Badge variant="secondary" className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs Attention
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
        <Flame className="h-3 w-3 mr-1 animate-pulse" />
        Warming
      </Badge>
    );
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const temperature = connection.warmy_temperature || 0;
  const dailyLimit = connection.daily_send_limit || 5;
  const sentToday = connection.emails_sent_today || 0;

  return (
    <Card className={cn(
      "transition-all",
      connection.warmy_state === 'paused' && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Thermometer className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">{connection.email_address}</p>
              <p className="text-xs text-muted-foreground capitalize">{connection.provider}</p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature Gauge */}
        <TemperatureGauge temperature={temperature} size="sm" />

        {/* Daily Capacity */}
        <SendingCapacityBar 
          sent={sentToday} 
          limit={dailyLimit} 
          size="sm" 
        />
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className={cn("text-lg font-bold", getScoreColor(connection.deliverability_score))}>
              {connection.deliverability_score ?? '—'}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Deliverability</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className={cn("text-lg font-bold", getScoreColor(connection.placement_score))}>
              {connection.placement_score ?? '—'}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Placement</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/50">
            <p className={cn("text-lg font-bold", getScoreColor(connection.dns_score))}>
              {connection.dns_score ?? '—'}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DNS</p>
          </div>
        </div>

        {/* Last Sync */}
        {connection.last_warmy_sync && (
          <p className="text-xs text-muted-foreground text-center">
            Last synced: {new Date(connection.last_warmy_sync).toLocaleString()}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {connection.warmy_state === 'paused' ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleResume}
              disabled={isActionLoading !== null || !canResume}
              title={!warmupStarted ? 'Warmup has not started yet—sync first, then try again.' : undefined}
            >
              {isActionLoading === 'resume' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Play className="h-3 w-3 mr-1" />
              )}
              Resume
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handlePause}
              disabled={isActionLoading !== null || !canPause}
              title={!warmupStarted ? 'Warmup has not started yet—sync first, then try again.' : undefined}
            >
              {isActionLoading === 'pause' ? (
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              ) : (
                <Pause className="h-3 w-3 mr-1" />
              )}
              Pause
            </Button>
          )}
          
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={handleTest}
            disabled={isActionLoading !== null}
          >
            {isActionLoading === 'test' ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <FlaskConical className="h-3 w-3 mr-1" />
            )}
            Test
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(connection)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
