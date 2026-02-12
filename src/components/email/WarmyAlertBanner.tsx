import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { WarmyConnection } from '@/hooks/useWarmyStatus';

interface WarmyAlertBannerProps {
  connections: WarmyConnection[];
  onDismiss?: () => void;
}

export function WarmyAlertBanner({ connections, onDismiss }: WarmyAlertBannerProps) {
  const navigate = useNavigate();
  
  const lowScoreConnections = connections.filter(
    c => c.warmy_mailbox_id && (c.deliverability_score || 100) < 50
  );

  if (lowScoreConnections.length === 0) return null;

  const connection = lowScoreConnections[0];

  return (
    <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
      <AlertTriangle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">
          Low Deliverability Alert
        </p>
        <p className="text-sm text-muted-foreground mt-0.5">
          {connection.email_address} has a deliverability score of {connection.deliverability_score}%.
          {(connection.deliverability_score || 0) < 50 && (
            <span className="font-medium"> Outreach campaigns from this mailbox are auto-paused.</span>
          )}
        </p>
        <Button 
          variant="link" 
          size="sm" 
          className="text-primary p-0 h-auto mt-1"
          onClick={() => navigate('/dashboard/settings')}
        >
          View in Settings →
        </Button>
      </div>
      {onDismiss && (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-muted-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
