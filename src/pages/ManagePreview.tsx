import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ManageToolbar from '@/components/manage/ManageToolbar';
import PreviewFrame from '@/components/manage/PreviewFrame';
import FeedbackPanel from '@/components/manage/FeedbackPanel';
import QuickEdit from '@/components/manage/QuickEdit';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;
type Viewport = 'desktop' | 'tablet' | 'mobile';

export default function ManagePreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [preview, setPreview] = useState<ClientPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchPreview();
      fetchFeedbackCount();
    }
  }, [id, user]);

  const fetchPreview = async () => {
    const { data, error } = await supabase
      .from('client_previews')
      .select('*')
      .eq('id', id)
      .eq('user_id', user?.id)
      .maybeSingle();

    if (error || !data) {
      toast({
        title: 'Preview not found',
        description: 'This preview does not exist or you do not have access.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    setPreview(data);
    setLoading(false);
  };

  const fetchFeedbackCount = async () => {
    const { count } = await supabase
      .from('client_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('preview_id', id)
      .eq('is_read', false);

    setFeedbackCount(count || 0);
  };

  const handleStatusChange = async (status: 'draft' | 'sent' | 'feedback_received') => {
    if (!preview) return;

    const { error } = await supabase
      .from('client_previews')
      .update({ status })
      .eq('id', preview.id);

    if (error) {
      toast({
        title: 'Error updating status',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreview({ ...preview, status });
      toast({ title: 'Status updated' });
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!preview) return;

    const { error } = await supabase
      .from('client_previews')
      .update({ template_id: templateId })
      .eq('id', preview.id);

    if (error) {
      toast({
        title: 'Error updating template',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreview({ ...preview, template_id: templateId });
      setIframeKey(k => k + 1); // Force iframe refresh
      toast({ title: 'Template updated' });
    }
  };

  const handleDelete = async () => {
    if (!preview) return;

    const { error } = await supabase
      .from('client_previews')
      .delete()
      .eq('id', preview.id);

    if (error) {
      toast({
        title: 'Error deleting preview',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({ title: 'Preview deleted' });
      navigate('/dashboard');
    }
  };

  const handleSave = async (updatedData: Partial<ClientPreview>) => {
    if (!preview) return;

    const { error } = await supabase
      .from('client_previews')
      .update(updatedData)
      .eq('id', preview.id);

    if (error) {
      toast({
        title: 'Error saving changes',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setPreview({ ...preview, ...updatedData });
      setIframeKey(k => k + 1);
      toast({ title: 'Changes saved' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <div className="border-b bg-background p-4">
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <Skeleton className="w-full max-w-5xl aspect-video rounded-lg" />
        </div>
      </div>
    );
  }

  if (!preview) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Preview Not Found</h1>
          <p className="text-muted-foreground mb-4">
            This preview doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <ManageToolbar
        preview={preview}
        viewport={viewport}
        onViewportChange={setViewport}
        onStatusChange={handleStatusChange}
        onTemplateChange={handleTemplateChange}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={handleDelete}
        feedbackCount={feedbackCount}
      />

      <div className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-auto">
        <PreviewFrame
          key={iframeKey}
          slug={preview.slug}
          viewport={viewport}
        />
      </div>

      <FeedbackPanel
        previewId={preview.id}
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onFeedbackRead={() => setFeedbackCount(c => Math.max(0, c - 1))}
      />

      <QuickEdit
        preview={preview}
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
