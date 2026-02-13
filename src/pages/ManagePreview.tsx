import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import ManageSidebar from '@/components/manage/ManageSidebar';
import PreviewFrame from '@/components/manage/PreviewFrame';
import FeedbackPanel from '@/components/manage/FeedbackPanel';
import QuickEdit from '@/components/manage/QuickEdit';
import { Globe } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;
type Viewport = 'desktop' | 'tablet' | 'mobile';

export default function ManagePreview() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
      setIframeKey(k => k + 1);
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

  const handleExportCode = () => {
    const iframe = iframeRef.current;
    if (!iframe) {
      toast({ title: 'Preview not ready', description: 'Please wait for the preview to load.', variant: 'destructive' });
      return;
    }

    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        toast({ title: 'Cannot access preview', description: 'The preview content is not accessible.', variant: 'destructive' });
        return;
      }

      // Clone the document
      const clone = iframeDoc.documentElement.cloneNode(true) as HTMLElement;

      // Remove the feedback button and creator footer (pitch-specific UI)
      clone.querySelectorAll('[data-pitch-ui]').forEach(el => el.remove());

      // Gather all stylesheets and inline them
      const styleSheets = Array.from(iframeDoc.styleSheets);
      let allCSS = '';

      for (const sheet of styleSheets) {
        try {
          const rules = Array.from(sheet.cssRules || []);
          for (const rule of rules) {
            allCSS += rule.cssText + '\n';
          }
        } catch {
          // Cross-origin stylesheet - try to fetch it
          if (sheet.href) {
            // We'll handle this with a link tag instead
            const linkEl = clone.querySelector('head');
            if (linkEl) {
              const link = iframeDoc.createElement('link');
              link.rel = 'stylesheet';
              link.href = sheet.href;
              linkEl.appendChild(link);
            }
          }
        }
      }

      // Inline computed styles for elements to ensure pixel-perfect export
      const head = clone.querySelector('head');
      if (head) {
        // Remove existing style/link tags to avoid duplication, we'll add our collected CSS
        // Keep link tags for external fonts
        const existingStyles = head.querySelectorAll('style, link[rel="stylesheet"]');
        existingStyles.forEach(el => el.remove());

        // Add all collected CSS
        const styleTag = iframeDoc.createElement('style');
        styleTag.textContent = allCSS;
        head.appendChild(styleTag);

        // Add meta tags
        const existingMeta = head.querySelector('meta[charset]');
        if (!existingMeta) {
          const meta = iframeDoc.createElement('meta');
          meta.setAttribute('charset', 'UTF-8');
          head.insertBefore(meta, head.firstChild);
        }

        const existingViewport = head.querySelector('meta[name="viewport"]');
        if (!existingViewport) {
          const viewport = iframeDoc.createElement('meta');
          viewport.name = 'viewport';
          viewport.content = 'width=device-width, initial-scale=1.0';
          head.appendChild(viewport);
        }

        // Update title
        let titleEl = head.querySelector('title');
        if (!titleEl) {
          titleEl = iframeDoc.createElement('title');
          head.appendChild(titleEl);
        }
        const schema = preview?.processed_schema as any;
        titleEl.textContent = schema?.companyName || preview?.client_name || 'Website';
      }

      // Remove any script tags (React runtime, etc.)
      clone.querySelectorAll('script').forEach(el => el.remove());

      // Convert all relative URLs to absolute
      const baseUrl = window.location.origin;
      clone.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && src.startsWith('/')) {
          img.setAttribute('src', baseUrl + src);
        }
      });
      clone.querySelectorAll('[style]').forEach(el => {
        const style = el.getAttribute('style');
        if (style && style.includes('url(/')) {
          el.setAttribute('style', style.replace(/url\(\//g, `url(${baseUrl}/`));
        }
      });

      // Build final HTML
      const finalHTML = `<!DOCTYPE html>\n${clone.outerHTML}`;

      // Download
      const slug = preview?.slug?.replace(/\//g, '-') || 'export';
      const blob = new Blob([finalHTML], { type: 'text/html;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${slug}-website.html`;
      link.click();
      URL.revokeObjectURL(link.href);

      toast({ title: 'Website exported!', description: 'Complete HTML file with all styles downloaded.' });
    } catch (err) {
      console.error('Export error:', err);
      toast({ title: 'Export failed', description: 'Could not export the preview. Please try again.', variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex">
        <div className="w-72 bg-background border-r border-border p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
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
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Globe className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-semibold mb-2">Preview Not Found</h1>
          <p className="text-muted-foreground mb-6 max-w-sm">
            This preview doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <ManageSidebar
        preview={preview}
        viewport={viewport}
        onViewportChange={setViewport}
        onStatusChange={handleStatusChange}
        onTemplateChange={handleTemplateChange}
        onOpenFeedback={() => setFeedbackOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={handleDelete}
        onExportCode={handleExportCode}
        onPreviewUpdate={(updates) => {
          setPreview(prev => prev ? { ...prev, ...updates } : prev);
          setIframeKey(k => k + 1);
        }}
        feedbackCount={feedbackCount}
      />

      <main className="flex-1 flex items-start justify-center p-6 lg:p-8 overflow-auto">
        <PreviewFrame
          ref={iframeRef}
          key={iframeKey}
          slug={preview.slug}
          viewport={viewport}
        />
      </main>

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
