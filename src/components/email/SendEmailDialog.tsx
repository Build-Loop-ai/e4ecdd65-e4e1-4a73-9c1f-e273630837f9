import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Mail, AlertCircle, Settings, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmailConnections } from '@/hooks/useEmailConnections';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DEFAULT_PITCH_SUBJECT,
  DEFAULT_PITCH_TEMPLATE,
  renderEmailTemplate,
  renderSubject,
} from '@/lib/emailTemplates';
import { SendHealthCheck } from './SendHealthCheck';

interface SendEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientEmail?: string;
  recipientName?: string;
  previewId: string;
  previewUrl: string;
  leadId?: string;
  primaryColor?: string;
}

export function SendEmailDialog({
  open,
  onOpenChange,
  recipientEmail = '',
  recipientName = '',
  previewId,
  previewUrl,
  leadId,
  primaryColor = '#3b82f6',
}: SendEmailDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connections, getActiveConnection, isLoading: connectionsLoading } = useEmailConnections();

  const [to, setTo] = useState(recipientEmail);
  const [toName, setToName] = useState(recipientName);
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [senderProfile, setSenderProfile] = useState<{ full_name: string; business_name: string } | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');

  // Reset form when dialog opens with new data
  useEffect(() => {
    if (open) {
      setTo(recipientEmail);
      setToName(recipientName);
      setSubject(renderSubject(DEFAULT_PITCH_SUBJECT, recipientName || 'there'));
    }
  }, [open, recipientEmail, recipientName]);

  // Fetch sender profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, business_name')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setSenderProfile(data as any);
      }
    };
    fetchProfile();
  }, [user]);

  // Set default connection
  useEffect(() => {
    if (connections.length > 0 && !selectedConnectionId) {
      const active = connections.find(c => c.is_active);
      if (active) setSelectedConnectionId(active.id);
      else setSelectedConnectionId(connections[0].id);
    }
  }, [connections, selectedConnectionId]);

  const selectedConnection = useMemo(() => {
    return connections.find(c => c.id === selectedConnectionId);
  }, [connections, selectedConnectionId]);

  const emailPreviewHtml = useMemo(() => {
    return renderEmailTemplate(DEFAULT_PITCH_TEMPLATE, {
      recipientName: toName || 'there',
      previewUrl,
      senderName: senderProfile?.full_name || 'Your Name',
      senderBusiness: senderProfile?.business_name || '',
      primaryColor,
    });
  }, [toName, previewUrl, senderProfile, primaryColor]);

  const handleSend = async () => {
    if (!to || !subject || !selectedConnection) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);

    try {
      const response = await supabase.functions.invoke('send-email', {
        body: {
          to,
          toName,
          subject,
          bodyHtml: emailPreviewHtml,
          previewId,
          leadId,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success(`Email sent to ${to}!`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Send email error:', error);
      toast.error(error.message || 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  const hasConnections = connections.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Pitch Email
          </DialogTitle>
          <DialogDescription>
            Send a professional pitch email with a link to the preview
          </DialogDescription>
        </DialogHeader>

        {connectionsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !hasConnections ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-2">No Email Connected</h3>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Connect your Gmail or Outlook account in Settings to start sending pitch emails directly from the platform.
            </p>
            <Button onClick={() => navigate('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Go to Settings
            </Button>
          </div>
        ) : (
        <>
            <div className="space-y-4">
              {/* Send Health Check */}
              {selectedConnection?.warmy_mailbox_id && (
                <SendHealthCheck 
                  connectionId={selectedConnectionId}
                  onReadinessChange={setCanSend}
                  compact={true}
                />
              )}

              {/* From Selector */}
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select email account" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map(conn => (
                      <SelectItem key={conn.id} value={conn.id}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {conn.email_address}
                          <Badge variant="secondary" className="text-xs">
                            {conn.provider === 'gmail' ? 'Gmail' : 'Outlook'}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To Email */}
              <div className="space-y-2">
                <Label htmlFor="to-email">To *</Label>
                <Input
                  id="to-email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={e => setTo(e.target.value)}
                />
              </div>

              {/* Recipient Name */}
              <div className="space-y-2">
                <Label htmlFor="to-name">Recipient Name</Label>
                <Input
                  id="to-name"
                  placeholder="John's Bakery"
                  value={toName}
                  onChange={e => {
                    setToName(e.target.value);
                    setSubject(renderSubject(DEFAULT_PITCH_SUBJECT, e.target.value || 'there'));
                  }}
                />
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="Your new website preview is ready!"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
              </div>

              {/* Email Preview */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div 
                    className="p-4 text-sm max-h-[200px] overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSend} 
                disabled={isSending || !to || !subject || (!canSend && !!selectedConnection?.warmy_mailbox_id)}
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Send Email
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
