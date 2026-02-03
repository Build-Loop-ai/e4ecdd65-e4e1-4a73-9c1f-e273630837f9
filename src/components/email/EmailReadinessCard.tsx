import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Thermometer, 
  ChevronRight, 
  FlaskConical, 
  CheckCircle2, 
  AlertTriangle, 
  Pause,
  Loader2,
  Zap,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWarmyStatus, WarmyConnection } from '@/hooks/useWarmyStatus';
import { TemperatureGauge } from './TemperatureGauge';
import { SendingCapacityBar } from './SendingCapacityBar';
import { cn } from '@/lib/utils';

export function EmailReadinessCard() {
  const navigate = useNavigate();
  const { 
    warmyConnections, 
    isLoading, 
    isSyncing,
    averageDeliverability,
    connectionsNeedingAttention,
    syncScores,
    runDeliverabilityTest,
  } = useWarmyStatus();
  
  const [isRunningTest, setIsRunningTest] = useState(false);

  // Get the primary connection (first active one)
  const primaryConnection = warmyConnections.find(c => c.warmy_state === 'active') || warmyConnections[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Don't show if no Warmy connections
  if (warmyConnections.length === 0) {
    return null;
  }

  const temperature = primaryConnection?.warmy_temperature || 0;
  const dailyLimit = primaryConnection?.daily_send_limit || 5;
  const sentToday = primaryConnection?.emails_sent_today || 0;
  const deliverabilityScore = primaryConnection?.deliverability_score;

  const getReadinessStatus = () => {
    if (primaryConnection?.warmy_state === 'paused') {
      return { 
        label: 'Paused', 
        color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
        icon: Pause 
      };
    }
    if (temperature >= 85 && (deliverabilityScore === null || deliverabilityScore >= 70)) {
      return { 
        label: 'Ready to Send', 
        color: 'bg-green-500/10 text-green-600 border-green-500/20',
        icon: CheckCircle2 
      };
    }
    if (temperature >= 60) {
      return { 
        label: 'Almost Ready', 
        color: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: Zap 
      };
    }
    return { 
      label: 'Warming Up', 
      color: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      icon: Clock 
    };
  };

  const status = getReadinessStatus();
  const StatusIcon = status.icon;

  const estimatedDaysRemaining = temperature < 85 
    ? Math.ceil((85 - temperature) / 3) // Roughly 3% per day
    : 0;

  const handleRunTest = async () => {
    if (!primaryConnection) return;
    setIsRunningTest(true);
    await runDeliverabilityTest(primaryConnection.id);
    setIsRunningTest(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Thermometer className="h-4 w-4 text-primary" />
            Email Readiness
          </CardTitle>
          <Badge variant="secondary" className={cn('text-xs', status.color)}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Temperature Gauge */}
        <TemperatureGauge temperature={temperature} size="sm" />

        {/* Estimated time remaining */}
        {estimatedDaysRemaining > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            ~{estimatedDaysRemaining} days until full warmup
          </p>
        )}

        {/* Sending Capacity */}
        <SendingCapacityBar 
          sent={sentToday} 
          limit={dailyLimit} 
          size="sm"
          showWarning={true}
        />

        {/* Health Score */}
        {deliverabilityScore !== null && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Deliverability</span>
            <Badge 
              variant="secondary"
              className={cn(
                'text-xs',
                deliverabilityScore >= 80 
                  ? 'bg-green-500/10 text-green-600' 
                  : deliverabilityScore >= 60 
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-red-500/10 text-red-600'
              )}
            >
              {deliverabilityScore}%
            </Badge>
          </div>
        )}

        {/* Attention Alert */}
        {connectionsNeedingAttention.length > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-600">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs">
              {connectionsNeedingAttention.length} mailbox{connectionsNeedingAttention.length !== 1 ? 'es' : ''} need{connectionsNeedingAttention.length === 1 ? 's' : ''} attention
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-xs"
            onClick={handleRunTest}
            disabled={isRunningTest || !primaryConnection}
          >
            {isRunningTest ? (
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
            ) : (
              <FlaskConical className="h-3 w-3 mr-1" />
            )}
            Run Test
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1 text-xs"
            onClick={() => navigate('/dashboard/settings')}
          >
            View Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Multiple mailboxes indicator */}
        {warmyConnections.length > 1 && (
          <p className="text-[10px] text-center text-muted-foreground">
            +{warmyConnections.length - 1} more mailbox{warmyConnections.length > 2 ? 'es' : ''} warming
          </p>
        )}
      </CardContent>
    </Card>
  );
}
