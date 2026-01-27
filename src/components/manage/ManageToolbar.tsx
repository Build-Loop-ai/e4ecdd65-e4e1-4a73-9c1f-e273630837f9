import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  Pencil,
  Trash2,
  LayoutTemplate,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ClientPreview = Tables<'client_previews'>;
type Viewport = 'desktop' | 'tablet' | 'mobile';

interface ManageToolbarProps {
  preview: ClientPreview;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
  onStatusChange: (status: 'draft' | 'sent' | 'feedback_received') => void;
  onTemplateChange: (templateId: string) => void;
  onOpenFeedback: () => void;
  onEdit: () => void;
  onDelete: () => void;
  feedbackCount: number;
}

export default function ManageToolbar({
  preview,
  viewport,
  onViewportChange,
  onStatusChange,
  onTemplateChange,
  onOpenFeedback,
  onEdit,
  onDelete,
  feedbackCount,
}: ManageToolbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const previewUrl = `${window.location.origin}/preview/${preview.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(previewUrl);
    toast({ title: 'Link copied!' });
  };

  const openExternal = () => {
    window.open(previewUrl, '_blank');
  };

  const markAsSent = () => {
    onStatusChange('sent');
    copyLink();
  };

  const schema = preview.processed_schema as any;
  const companyName = schema?.companyName || preview.client_name;

  return (
    <div className="border-b bg-background sticky top-0 z-50">
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <div className="hidden sm:block">
            <span className="text-sm text-muted-foreground">Managing:</span>
            <span className="ml-2 font-semibold">{companyName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Selector */}
          <Select
            value={preview.status}
            onValueChange={(value: 'draft' | 'sent' | 'feedback_received') => onStatusChange(value)}
          >
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="feedback_received">Feedback</SelectItem>
            </SelectContent>
          </Select>

          {/* Share Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={copyLink}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={openExternal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={markAsSent}>
                <Share2 className="h-4 w-4 mr-2" />
                Copy & Mark as Sent
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Row - Actions */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Viewport Toggles */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <Button
            variant={viewport === 'desktop' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewportChange('desktop')}
          >
            <Monitor className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Desktop</span>
          </Button>
          <Button
            variant={viewport === 'tablet' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewportChange('tablet')}
          >
            <Tablet className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Tablet</span>
          </Button>
          <Button
            variant={viewport === 'mobile' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-8 px-3"
            onClick={() => onViewportChange('mobile')}
          >
            <Smartphone className="h-4 w-4" />
            <span className="hidden md:inline ml-2">Mobile</span>
          </Button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Template Switcher */}
          <Select
            value={preview.template_id}
            onValueChange={onTemplateChange}
          >
            <SelectTrigger className="w-[160px] h-9">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern-professional">Modern</SelectItem>
              <SelectItem value="corporate-classic">Classic</SelectItem>
            </SelectContent>
          </Select>

          {/* Edit Button */}
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>

          {/* Feedback Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenFeedback}
            className="relative"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback
            {feedbackCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
              >
                {feedbackCount}
              </Badge>
            )}
          </Button>

          {/* Delete Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Preview?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the preview for {companyName}.
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
