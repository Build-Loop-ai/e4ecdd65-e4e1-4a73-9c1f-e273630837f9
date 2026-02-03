import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  FlaskConical,
  Unplug,
  RefreshCw,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { WarmyConnection, WarmyMailboxDetails } from '@/hooks/useWarmyStatus';
import { TemperatureGauge } from './TemperatureGauge';
import { SendingCapacityBar } from './SendingCapacityBar';
import { cn } from '@/lib/utils';

interface WarmyDetailsSheetProps {
  connection: WarmyConnection | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGetDetails: (connectionId: string) => Promise<WarmyMailboxDetails | null>;
  onRunTest: (connectionId: string) => Promise<any>;
  onDisconnect: (connectionId: string) => Promise<boolean>;
}

export function WarmyDetailsSheet({
  connection,
  open,
  onOpenChange,
  onGetDetails,
  onRunTest,
  onDisconnect,
}: WarmyDetailsSheetProps) {
  const [details, setDetails] = useState<WarmyMailboxDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  useEffect(() => {
    if (open && connection) {
      loadDetails();
    }
  }, [open, connection]);

  const loadDetails = async () => {
    if (!connection) return;
    setIsLoading(true);
    const data = await onGetDetails(connection.id);
    setDetails(data);
    setIsLoading(false);
  };

  const handleRunTest = async () => {
    if (!connection) return;
    setIsRunningTest(true);
    await onRunTest(connection.id);
    setIsRunningTest(false);
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    setIsDisconnecting(true);
    const success = await onDisconnect(connection.id);
    setIsDisconnecting(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWarmupProgress = () => {
    if (!connection?.warmup_started_at) return null;
    const started = new Date(connection.warmup_started_at);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - started.getTime()) / (1000 * 60 * 60 * 24));
    const totalDays = 28;
    const progress = Math.min((daysPassed / totalDays) * 100, 100);
    return { daysPassed, totalDays, progress };
  };

  if (!connection) return null;

  const warmupProgress = getWarmupProgress();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Mailbox Details</SheetTitle>
          <SheetDescription>{connection.email_address}</SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Temperature & Health Overview */}
              <div className="space-y-4">
                <TemperatureGauge 
                  temperature={connection.warmy_temperature || 0} 
                  size="md" 
                />
                
                {warmupProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Warmup Progress</span>
                      </div>
                      <span className="font-medium">
                        Day {warmupProgress.daysPassed} of {warmupProgress.totalDays}
                      </span>
                    </div>
                    <Progress value={warmupProgress.progress} className="h-2" />
                  </div>
                )}

                <SendingCapacityBar 
                  sent={connection.emails_sent_today || 0}
                  limit={connection.daily_send_limit || 5}
                  size="md"
                />
              </div>

              <Separator />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{details?.sent_today ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Warmup Sent</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{details?.received_today ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Warmup Received</p>
                </div>
              </div>

              {/* Health Scores */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Health Scores
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className={cn("text-xl font-bold", getScoreColor(connection.deliverability_score))}>
                      {connection.deliverability_score ?? '—'}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Deliverability</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className={cn("text-xl font-bold", getScoreColor(connection.placement_score))}>
                      {connection.placement_score ?? '—'}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Placement</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className={cn("text-xl font-bold", getScoreColor(connection.dns_score))}>
                      {connection.dns_score ?? '—'}%
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">DNS</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* DNS Records */}
              <div>
                <h4 className="font-medium mb-3">DNS Records</h4>
                <div className="rounded-lg border divide-y">
                  <div className="p-3 space-y-1">
                    {[
                      { name: 'SPF', status: details?.dns_records?.spf },
                      { name: 'DKIM', status: details?.dns_records?.dkim },
                      { name: 'DMARC', status: details?.dns_records?.dmarc },
                      { name: 'MX', status: details?.dns_records?.mx_record },
                      { name: 'A Record', status: details?.dns_records?.a_record },
                      { name: 'Reverse DNS', status: details?.dns_records?.r_dns },
                    ].map((record) => (
                      <div key={record.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          {record.status === true ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : record.status === false ? (
                            <X className="h-4 w-4 text-red-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm">{record.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {record.status === true ? 'Valid' : record.status === false ? 'Missing' : 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Provider Deliverability */}
              {details?.latest_deliverability_test && (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Provider Scores</h4>
                      {details.latest_deliverability_test.tested_at && (
                        <span className="text-xs text-muted-foreground">
                          {new Date(details.latest_deliverability_test.tested_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {[
                        { name: 'Google', score: details.latest_deliverability_test.google },
                        { name: 'Outlook', score: details.latest_deliverability_test.outlook },
                        { name: 'Yahoo', score: details.latest_deliverability_test.yahoo },
                      ].map((provider) => (
                        <div key={provider.name} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{provider.name}</span>
                            <span className={cn("font-medium", getScoreColor(provider.score ?? null))}>
                              {provider.score ?? '—'}%
                            </span>
                          </div>
                          <Progress value={provider.score ?? 0} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleRunTest}
                  disabled={isRunningTest}
                >
                  {isRunningTest ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FlaskConical className="h-4 w-4 mr-2" />
                  )}
                  Run Deliverability Test
                </Button>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={loadDetails}
                    disabled={isLoading}
                  >
                    <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                    Refresh
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="flex-1"
                    onClick={handleDisconnect}
                    disabled={isDisconnecting}
                  >
                    {isDisconnecting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Unplug className="h-4 w-4 mr-2" />
                    )}
                    Disconnect
                  </Button>
                </div>
              </div>

              {/* Last Sync */}
              {connection.last_warmy_sync && (
                <p className="text-xs text-muted-foreground text-center">
                  Last synced: {new Date(connection.last_warmy_sync).toLocaleString()}
                </p>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
