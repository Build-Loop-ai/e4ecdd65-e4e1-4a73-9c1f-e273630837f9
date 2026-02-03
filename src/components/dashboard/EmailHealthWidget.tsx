import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, AlertTriangle, ChevronRight, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWarmyStatus } from '@/hooks/useWarmyStatus';

export function EmailHealthWidget() {
  const navigate = useNavigate();
  const { 
    warmyConnections, 
    isLoading, 
    averageDeliverability,
    connectionsNeedingAttention 
  } = useWarmyStatus();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Don't show if no Warmy connections
  if (warmyConnections.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Mail className="h-4 w-4" />
          Email Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-orange-500" />
          <span className="text-sm text-muted-foreground">
            {warmyConnections.length} mailbox{warmyConnections.length !== 1 ? 'es' : ''} warming
          </span>
        </div>

        {averageDeliverability !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Avg. Deliverability</span>
            <Badge 
              variant="secondary"
              className={
                averageDeliverability >= 80 
                  ? 'bg-green-500/10 text-green-600' 
                  : averageDeliverability >= 60 
                    ? 'bg-yellow-500/10 text-yellow-600'
                    : 'bg-red-500/10 text-red-600'
              }
            >
              {averageDeliverability}%
            </Badge>
          </div>
        )}

        {connectionsNeedingAttention.length > 0 && (
          <div className="flex items-center gap-2 text-orange-600">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              {connectionsNeedingAttention.length} mailbox{connectionsNeedingAttention.length !== 1 ? 'es' : ''} need{connectionsNeedingAttention.length === 1 ? 's' : ''} attention
            </span>
          </div>
        )}

        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-between"
          onClick={() => navigate('/dashboard/settings')}
        >
          View Details
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
