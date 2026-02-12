import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Eye, MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Reminder {
  type: 'no_visit' | 'no_feedback';
  leadName: string;
  email: string;
  sentAt: string;
  previewId: string;
  leadId: string;
}

export function FollowUpReminders() {
  const { user } = useAuth();

  const { data: reminders = [] } = useQuery({
    queryKey: ['follow-up-reminders', user?.id],
    queryFn: async (): Promise<Reminder[]> => {
      if (!user?.id) return [];

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Get emails sent more than 3 days ago
      const { data: emails } = await supabase
        .from('outreach_emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'sent')
        .lt('sent_at', threeDaysAgo.toISOString())
        .order('sent_at', { ascending: false })
        .limit(20);

      if (!emails || emails.length === 0) return [];

      const previewIds = [...new Set(emails.map(e => e.preview_id))];

      // Check which previews have visits
      const { data: visits } = await supabase
        .from('preview_visits')
        .select('preview_id')
        .in('preview_id', previewIds);

      const visitedPreviews = new Set((visits || []).map(v => v.preview_id));

      // Check which previews have feedback
      const { data: feedback } = await supabase
        .from('client_feedback')
        .select('preview_id')
        .in('preview_id', previewIds);

      const feedbackPreviews = new Set((feedback || []).map(f => f.preview_id));

      const results: Reminder[] = [];
      for (const email of emails) {
        const hasVisit = visitedPreviews.has(email.preview_id);
        const hasFeedback = feedbackPreviews.has(email.preview_id);

        if (!hasVisit) {
          results.push({
            type: 'no_visit',
            leadName: email.recipient_name || email.recipient_email,
            email: email.recipient_email,
            sentAt: email.sent_at,
            previewId: email.preview_id,
            leadId: email.lead_id || '',
          });
        } else if (!hasFeedback) {
          results.push({
            type: 'no_feedback',
            leadName: email.recipient_name || email.recipient_email,
            email: email.recipient_email,
            sentAt: email.sent_at,
            previewId: email.preview_id,
            leadId: email.lead_id || '',
          });
        }
      }

      return results.slice(0, 5);
    },
    enabled: !!user?.id,
  });

  if (reminders.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-medium text-foreground">Follow-Up Suggestions</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {reminders.map((r, i) => (
          <Card key={i} className="border-border hover:shadow-sm transition-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                  r.type === 'no_visit' ? 'bg-destructive/10' : 'bg-primary/10'
                }`}>
                  {r.type === 'no_visit' ? (
                    <Eye className="h-4 w-4 text-destructive" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{r.leadName}</p>
                  <p className="text-xs text-muted-foreground">
                    Sent {formatDistanceToNow(new Date(r.sentAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {r.type === 'no_visit'
                  ? "Hasn't viewed the pitch yet. A short follow-up could help."
                  : "Viewed the pitch but left no feedback. Ask what they thought."}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={() => window.open(`mailto:${r.email}`, '_blank')}
              >
                <Send className="h-3 w-3" />
                Follow Up
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
