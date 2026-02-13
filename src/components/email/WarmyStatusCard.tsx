import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
  Trash2
} from 'lucide-react';
import { WarmyConnection } from '@/hooks/useWarmyStatus';
import { TemperatureGauge } from './TemperatureGauge';
import { SendingCapacityBar } from './SendingCapacityBar';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WarmyStatusCardProps {
  connection: WarmyConnection;
  onPause: (id: string) => Promise<boolean>;
  onResume: (id: string) => Promise<boolean>;
  onRunTest: (id: string) => Promise<any>;
  onViewDetails: (connection: WarmyConnection) => void;
  onDisconnect: (id: string) => Promise<boolean>;
}

export function WarmyStatusCard({ 
  connection, 
  onPause, 
  onResume, 
  onRunTest,
  onViewDetails,
  onDisconnect
}: WarmyStatusCardProps) {
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

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

  const handleDisconnect = async () => {
    setIsActionLoading('disconnect');
    await onDisconnect(connection.id);
    setIsActionLoading(null);
  };

  const getStatusBadge = () => {
    const temp = connection.warmy_temperature || 0;
    const score = connection.deliverability_score || 0;
    
    if (connection.warmy_state === 'paused') {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
          <Pause className="h-3 w-3 mr-1" />
          Paused
        </Badge>
      );
    }
    
    if (temp >= 90 && score >= 80) {
      return (
        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    }
    
    if (score < 70) {
      return (
        <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Needs Attention
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
        <Flame className="h-3 w-3 mr-1 animate-pulse" />
        Warming
      </Badge>
    );
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-primary/70';
    return 'text-destructive';
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
        <TemperatureGauge temperature={temperature} size="sm" />
        <SendingCapacityBar sent={sentToday} limit={dailyLimit} size="sm" />
        <TooltipProvider delayDuration={200}>
          <div className="grid grid-cols-3 gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-muted/50 cursor-help">
                  <p className={cn("text-lg font-bold", getScoreColor(connection.deliverability_score))}>
                    {connection.deliverability_score ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Deliverability</p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-center">
                <p className="text-xs">How likely your emails are to reach the recipient's inbox instead of spam.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-muted/50 cursor-help">
                  <p className={cn("text-lg font-bold", getScoreColor(connection.placement_score))}>
                    {connection.placement_score ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Placement</p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-center">
                <p className="text-xs">Where your emails land — primary inbox, promotions tab, or spam folder.</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="text-center p-2 rounded-lg bg-muted/50 cursor-help">
                  <p className={cn("text-lg font-bold", getScoreColor(connection.dns_score))}>
                    {connection.dns_score ?? '—'}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DNS</p>
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-[200px] text-center">
                <p className="text-xs">Health of your domain's email authentication (SPF, DKIM, DMARC records).</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        {connection.last_warmy_sync && (
          <p className="text-xs text-muted-foreground text-center">
            Last synced: {new Date(connection.last_warmy_sync).toLocaleString()}
          </p>
        )}

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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                disabled={isActionLoading !== null}
              >
                {isActionLoading === 'disconnect' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Disable Email Warmup?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will completely remove the warmup for <strong>{connection.email_address}</strong>. 
                  Your email will be disconnected from the warmup service and all warmup progress will be lost.
                  You can re-enable warmup later, but it will start from the beginning.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDisconnect}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Disable Warmup
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
