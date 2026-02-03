import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, RefreshCw, Loader2 } from 'lucide-react';
import { useWarmyStatus, WarmyConnection } from '@/hooks/useWarmyStatus';
import { WarmyStatusCard } from './WarmyStatusCard';
import { WarmyDetailsSheet } from './WarmyDetailsSheet';
import { WarmyAlertBanner } from './WarmyAlertBanner';

export function WarmySection() {
  const {
    warmyConnections,
    connections,
    isLoading,
    isSyncing,
    connectionsNeedingAttention,
    syncScores,
    pauseWarmup,
    resumeWarmup,
    runDeliverabilityTest,
    disconnectFromWarmy,
    getMailboxDetails,
    registerWithWarmy,
  } = useWarmyStatus();

  const [selectedConnection, setSelectedConnection] = useState<WarmyConnection | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  const handleViewDetails = (connection: WarmyConnection) => {
    setSelectedConnection(connection);
    setDetailsOpen(true);
  };

  const handleEnableWarmup = async (connectionId: string) => {
    setRegisteringId(connectionId);
    await registerWithWarmy(connectionId);
    setRegisteringId(null);
  };

  // Connections that could be enabled for warmup (have email but no warmy_mailbox_id)
  const eligibleConnections = connections.filter(
    c => c.is_active && !c.warmy_mailbox_id
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <CardTitle>Email Warmup</CardTitle>
            </div>
            {warmyConnections.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={syncScores}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Sync Scores
              </Button>
            )}
          </div>
          <CardDescription>
            Automatically warm up your email accounts for better deliverability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Alert Banner */}
          {connectionsNeedingAttention.length > 0 && (
            <WarmyAlertBanner connections={connectionsNeedingAttention} />
          )}

          {/* Active Warmy Connections */}
          {warmyConnections.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {warmyConnections.map(connection => (
                <WarmyStatusCard
                  key={connection.id}
                  connection={connection}
                  onPause={pauseWarmup}
                  onResume={resumeWarmup}
                  onRunTest={runDeliverabilityTest}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 px-4 border border-dashed rounded-lg">
              <Flame className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-medium text-foreground mb-1">No warmup active</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
                Enable email warmup on your connected accounts to improve deliverability before sending campaigns.
              </p>
            </div>
          )}

          {/* Eligible Connections (can be enabled) */}
          {eligibleConnections.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Available for warmup
              </h4>
              {eligibleConnections.map(conn => (
                <div 
                  key={conn.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{conn.email_address}</p>
                    <p className="text-xs text-muted-foreground capitalize">{conn.provider}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleEnableWarmup(conn.id)}
                    disabled={registeringId === conn.id}
                  >
                    {registeringId === conn.id ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Flame className="h-4 w-4 mr-2" />
                    )}
                    Enable Warmup
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details Sheet */}
      <WarmyDetailsSheet
        connection={selectedConnection}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onGetDetails={getMailboxDetails}
        onRunTest={runDeliverabilityTest}
        onDisconnect={disconnectFromWarmy}
      />
    </>
  );
}
