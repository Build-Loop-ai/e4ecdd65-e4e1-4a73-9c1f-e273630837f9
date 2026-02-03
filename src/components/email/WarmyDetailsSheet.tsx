import { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  FlaskConical,
  Unplug,
  RefreshCw
} from 'lucide-react';
import { WarmyConnection, WarmyMailboxDetails } from '@/hooks/useWarmyStatus';
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

  const DNSRecordRow = ({ 
    name, 
    status, 
    description 
  }: { 
    name: string; 
    status: boolean | undefined; 
    description: string;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        {status === true ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : status === false ? (
          <X className="h-4 w-4 text-red-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
        )}
        <span className="font-medium text-sm">{name}</span>
      </div>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );

  if (!connection) return null;

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
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{details?.sent_today ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Sent Today</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{details?.received_today ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">Received Today</p>
                </div>
              </div>

              <Separator />

              {/* DNS Records */}
              <div>
                <h4 className="font-medium mb-3">DNS Records</h4>
                <div className="rounded-lg border divide-y">
                  <div className="p-3">
                    <DNSRecordRow 
                      name="SPF Record" 
                      status={details?.dns_records?.spf}
                      description={details?.dns_records?.spf ? "Valid" : "Missing"}
                    />
                    <DNSRecordRow 
                      name="DKIM Record" 
                      status={details?.dns_records?.dkim}
                      description={details?.dns_records?.dkim ? "Valid" : "Missing"}
                    />
                    <DNSRecordRow 
                      name="DMARC Record" 
                      status={details?.dns_records?.dmarc}
                      description={details?.dns_records?.dmarc ? "Valid" : "Recommended"}
                    />
                    <DNSRecordRow 
                      name="MX Record" 
                      status={details?.dns_records?.mx_record}
                      description={details?.dns_records?.mx_record ? "Valid" : "Missing"}
                    />
                    <DNSRecordRow 
                      name="A Record" 
                      status={details?.dns_records?.a_record}
                      description={details?.dns_records?.a_record ? "Valid" : "Missing"}
                    />
                    <DNSRecordRow 
                      name="Reverse DNS" 
                      status={details?.dns_records?.r_dns}
                      description={details?.dns_records?.r_dns ? "Configured" : "Missing"}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Latest Deliverability Test */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Latest Deliverability Test</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleRunTest}
                    disabled={isRunningTest}
                  >
                    {isRunningTest ? (
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    ) : (
                      <FlaskConical className="h-3 w-3 mr-1" />
                    )}
                    Run Test
                  </Button>
                </div>
                
                {details?.latest_deliverability_test ? (
                  <div className="rounded-lg border p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className={cn(
                          "text-lg font-bold",
                          (details.latest_deliverability_test.google || 0) >= 80 
                            ? "text-green-600" 
                            : "text-yellow-600"
                        )}>
                          {details.latest_deliverability_test.google ?? '—'}%
                        </p>
                        <p className="text-xs text-muted-foreground">Google</p>
                      </div>
                      <div>
                        <p className={cn(
                          "text-lg font-bold",
                          (details.latest_deliverability_test.outlook || 0) >= 80 
                            ? "text-green-600" 
                            : "text-yellow-600"
                        )}>
                          {details.latest_deliverability_test.outlook ?? '—'}%
                        </p>
                        <p className="text-xs text-muted-foreground">Outlook</p>
                      </div>
                      <div>
                        <p className={cn(
                          "text-lg font-bold",
                          (details.latest_deliverability_test.yahoo || 0) >= 80 
                            ? "text-green-600" 
                            : "text-yellow-600"
                        )}>
                          {details.latest_deliverability_test.yahoo ?? '—'}%
                        </p>
                        <p className="text-xs text-muted-foreground">Yahoo</p>
                      </div>
                    </div>
                    {details.latest_deliverability_test.tested_at && (
                      <p className="text-xs text-muted-foreground text-center">
                        Tested: {new Date(details.latest_deliverability_test.tested_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No test results yet. Run a test to see inbox placement rates.
                    </p>
                  </div>
                )}
              </div>

              <Separator />

              {/* Refresh & Disconnect */}
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
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
