import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, Mail, User } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ClientFeedback = Tables<'client_feedback'>;

interface FeedbackPanelProps {
  previewId: string;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackRead: () => void;
}

export default function FeedbackPanel({
  previewId,
  isOpen,
  onClose,
  onFeedbackRead,
}: FeedbackPanelProps) {
  const { toast } = useToast();
  const [feedbackList, setFeedbackList] = useState<ClientFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFeedback();
    }
  }, [isOpen, previewId]);

  const fetchFeedback = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('client_feedback')
      .select('*')
      .eq('preview_id', previewId)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error loading feedback',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setFeedbackList(data || []);
    }
    setLoading(false);
  };

  const markAsRead = async (feedbackId: string) => {
    const { error } = await supabase
      .from('client_feedback')
      .update({ is_read: true })
      .eq('id', feedbackId);

    if (error) {
      toast({
        title: 'Error updating feedback',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setFeedbackList((prev) =>
        prev.map((f) => (f.id === feedbackId ? { ...f, is_read: true } : f))
      );
      onFeedbackRead();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Client Feedback</SheetTitle>
          <SheetDescription>
            {feedbackList.length} feedback item{feedbackList.length !== 1 ? 's' : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {loading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
              <p className="text-sm text-muted-foreground">
                Share the preview link with your client to receive feedback
              </p>
            </div>
          ) : (
            feedbackList.map((feedback) => (
              <div
                key={feedback.id}
                className={cn(
                  'p-4 rounded-lg border',
                  feedback.is_read ? 'bg-muted/30' : 'bg-background border-primary/30'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {feedback.client_name || 'Anonymous'}
                      </p>
                      {feedback.client_email && (
                        <p className="text-xs text-muted-foreground">
                          {feedback.client_email}
                        </p>
                      )}
                    </div>
                  </div>
                  {!feedback.is_read ? (
                    <Badge variant="default" className="text-xs">New</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Read</Badge>
                  )}
                </div>

                <p className="text-sm mb-3">{feedback.feedback_text}</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(feedback.created_at)}
                  </span>
                  {!feedback.is_read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsRead(feedback.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
