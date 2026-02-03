import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Loader2,
  Thermometer,
  Shield,
  Mail,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SendReadinessResult {
  canSend: boolean;
  remainingToday: number;
  dailyLimit: number;
  sentToday: number;
  temperature: number;
  temperatureReady: boolean;
  deliverabilityScore: number | null;
  deliverabilityHealthy: boolean;
  warnings: string[];
  suggestedWaitHours: number | null;
}

interface SendHealthCheckProps {
  connectionId: string;
  onReadinessChange?: (canSend: boolean) => void;
  compact?: boolean;
}

export function SendHealthCheck({ 
  connectionId, 
  onReadinessChange,
  compact = false 
}: SendHealthCheckProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [readiness, setReadiness] = useState<SendReadinessResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkReadiness();
  }, [connectionId]);

  const checkReadiness = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await supabase.functions.invoke('check-send-readiness', {
        body: { connection_id: connectionId },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const result = response.data as SendReadinessResult;
      setReadiness(result);
      onReadinessChange?.(result.canSend);
    } catch (err: any) {
      setError(err.message || 'Failed to check sending readiness');
      onReadinessChange?.(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4 rounded-lg border bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Checking email health...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10">
        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
        <span className="text-sm text-red-600">{error}</span>
      </div>
    );
  }

  if (!readiness) return null;

  const CheckItem = ({ 
    passed, 
    warning,
    label, 
    value,
    icon: Icon 
  }: { 
    passed: boolean; 
    warning?: boolean;
    label: string; 
    value?: string;
    icon: React.ElementType;
  }) => (
    <div className={cn(
      "flex items-center justify-between py-2",
      !compact && "px-3"
    )}>
      <div className="flex items-center gap-2">
        {passed && !warning ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : warning ? (
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-sm">{label}</span>
      </div>
      {value && (
        <span className={cn(
          "text-sm font-medium",
          passed && !warning ? 'text-green-600' : warning ? 'text-yellow-600' : 'text-red-600'
        )}>
          {value}
        </span>
      )}
    </div>
  );

  return (
    <div className={cn(
      "rounded-lg border",
      readiness.canSend 
        ? "border-green-500/20 bg-green-500/5" 
        : readiness.warnings.length > 0 && readiness.canSend
          ? "border-yellow-500/20 bg-yellow-500/5"
          : "border-red-500/20 bg-red-500/5"
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between p-3 border-b",
        readiness.canSend ? "border-green-500/20" : "border-red-500/20"
      )}>
        <span className="text-sm font-medium">Sending Health Check</span>
        <Badge 
          variant="secondary"
          className={cn(
            "text-xs",
            readiness.canSend 
              ? "bg-green-500/10 text-green-600" 
              : "bg-red-500/10 text-red-600"
          )}
        >
          {readiness.canSend ? 'Ready to Send' : 'Not Ready'}
        </Badge>
      </div>

      {/* Checks */}
      <div className={cn(compact ? "p-2" : "p-1", "divide-y divide-border")}>
        <CheckItem 
          passed={readiness.temperatureReady}
          warning={readiness.temperature >= 60 && readiness.temperature < 85}
          label="Mailbox warmed up"
          value={`${readiness.temperature}°`}
          icon={Thermometer}
        />
        <CheckItem 
          passed={readiness.deliverabilityHealthy}
          warning={readiness.deliverabilityScore !== null && readiness.deliverabilityScore >= 60 && readiness.deliverabilityScore < 70}
          label="Deliverability healthy"
          value={readiness.deliverabilityScore !== null ? `${readiness.deliverabilityScore}%` : 'N/A'}
          icon={Shield}
        />
        <CheckItem 
          passed={readiness.remainingToday > 0}
          label="Daily limit"
          value={`${readiness.sentToday}/${readiness.dailyLimit}`}
          icon={Mail}
        />
      </div>

      {/* Warnings */}
      {readiness.warnings.length > 0 && (
        <div className="p-3 border-t border-yellow-500/20 bg-yellow-500/5 space-y-1">
          {readiness.warnings.map((warning, i) => (
            <div key={i} className="flex items-start gap-2">
              <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-yellow-700">{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Suggested Wait */}
      {!readiness.canSend && readiness.suggestedWaitHours !== null && (
        <div className="p-3 border-t flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Try again in {readiness.suggestedWaitHours} hour{readiness.suggestedWaitHours !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
