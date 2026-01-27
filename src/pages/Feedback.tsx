import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Check } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ClientFeedback = Tables<'client_feedback'>;
type ClientPreview = Tables<'client_previews'>;

export default function Feedback() {
  const { previewId } = useParams<{ previewId: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [preview, setPreview] = useState<ClientPreview | null>(null);
  const [feedbackList, setFeedbackList] = useState<ClientFeedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (previewId && user) {
      fetchData();
    }
  }, [previewId, user]);

  const fetchData = async () => {
    // Fetch preview
    const { data: previewData } = await supabase
      .from('client_previews')
      .select('*')
      .eq('id', previewId)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (previewData) {
      setPreview(previewData);

      // Fetch feedback
      const { data: feedbackData, error } = await supabase
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
        setFeedbackList(feedbackData || []);
      }
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
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-8 w-32" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Preview Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This preview doesn't exist or you don't have access to it.
          </p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Client Feedback</h1>
          <p className="text-muted-foreground">
            Feedback for <span className="font-medium">{preview.client_name}</span>
          </p>
        </div>

        {feedbackList.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
              <p className="text-muted-foreground">
                Share the preview link with your client to receive feedback
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {feedbackList.map((feedback) => (
              <Card key={feedback.id} className={feedback.is_read ? 'opacity-75' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {feedback.client_name || 'Anonymous'}
                      </CardTitle>
                      {feedback.client_email && (
                        <CardDescription>{feedback.client_email}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {!feedback.is_read ? (
                        <Badge variant="default">New</Badge>
                      ) : (
                        <Badge variant="secondary">Read</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">{feedback.feedback_text}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(feedback.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {!feedback.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(feedback.id)}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
