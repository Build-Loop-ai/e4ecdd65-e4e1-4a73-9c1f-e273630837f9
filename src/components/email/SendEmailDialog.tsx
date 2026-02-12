import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Send, Mail, AlertCircle, Settings, Eye, PenLine, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmailConnections } from '@/hooks/useEmailConnections';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  DEFAULT_PITCH_TEMPLATE,
  renderEmailTemplate,
  wrapPlainTextEmail,
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
  primaryColor = '#4F46E5',
}: SendEmailDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connections, isLoading: connectionsLoading } = useEmailConnections();

  const [to, setTo] = useState(recipientEmail);
  const [toName, setToName] = useState(recipientName);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [canSend, setCanSend] = useState(true);
  const [senderProfile, setSenderProfile] = useState<{ full_name: string; business_name: string } | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string>('');
  const [pitchData, setPitchData] = useState<any>(null);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('full_name, business_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setSenderProfile(data as any);
    };
    fetchProfile();
  }, [user]);

  // Auto-select connection
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

  // Fetch pitch data when dialog opens
  useEffect(() => {
    if (!open || !previewId) return;
    const fetchPitch = async () => {
      const { data } = await supabase
        .from('client_previews')
        .select('processed_schema, client_name, scraped_content')
        .eq('id', previewId)
        .maybeSingle();
      if (data) setPitchData(data);
    };
    fetchPitch();
  }, [open, previewId]);

  // Generate AI copy when dialog opens
  const generateCopy = useCallback(async () => {
    if (!pitchData || !senderProfile) return;

    setIsGenerating(true);
    try {
      const schema = pitchData.processed_schema as any;
      const bi = schema?.businessIntelligence;

      // Detect language from existing content
      const heroHeadline = schema?.hero?.headline || '';
      const heroSub = schema?.hero?.subheadline || '';
      const services = schema?.services?.items?.map((s: any) => s.title)?.filter(Boolean) || [];

      const { data, error } = await supabase.functions.invoke('generate-email-copy', {
        body: {
          recipientName: toName || pitchData.client_name || 'there',
          businessName: pitchData.client_name || '',
          businessType: bi?.businessType || '',
          industry: bi?.industry || '',
          previewUrl,
          senderName: senderProfile.full_name || '',
          senderBusiness: senderProfile.business_name || '',
          language: schema?.language || '',
          services,
          heroHeadline,
          heroSubheadline: heroSub,
          targetAudience: bi?.targetAudience || '',
        },
      });

      if (error) {
        console.error('Generate copy error:', error);
        // Fall back to default template
        setFallbackCopy();
        return;
      }

      if (data?.subject) setSubject(data.subject);
      if (data?.body) setBodyText(data.body);
    } catch (err) {
      console.error('Generate copy failed:', err);
      setFallbackCopy();
    } finally {
      setIsGenerating(false);
    }
  }, [pitchData, senderProfile, toName, previewUrl]);

  const setFallbackCopy = () => {
    const fallback = renderEmailTemplate(DEFAULT_PITCH_TEMPLATE, {
      recipientName: toName || 'there',
      previewUrl,
      senderName: senderProfile?.full_name || '',
      senderBusiness: senderProfile?.business_name || '',
    });
    setSubject(`Quick idea for ${toName || pitchData?.client_name || 'your business'}`);
    setBodyText(fallback);
  };

  // Reset and generate when dialog opens
  useEffect(() => {
    if (open) {
      setTo(recipientEmail);
      setToName(recipientName);
      setSubject('');
      setBodyText('');
    }
  }, [open, recipientEmail, recipientName]);

  // Trigger AI generation once we have both pitch data and profile
  useEffect(() => {
    if (open && pitchData && senderProfile && !bodyText && !isGenerating) {
      generateCopy();
    }
  }, [open, pitchData, senderProfile, bodyText, isGenerating, generateCopy]);

  // Build preview HTML from plain text body
  const emailPreviewHtml = useMemo(() => {
    return bodyText ? wrapPlainTextEmail(bodyText) : '';
  }, [bodyText]);

  const handleSend = async () => {
    if (!to || !subject || !selectedConnection || !bodyText) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);

    try {
      const htmlToSend = wrapPlainTextEmail(bodyText);

      const response = await supabase.functions.invoke('send-email', {
        body: {
          to,
          toName,
          subject,
          bodyHtml: htmlToSend,
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="text-lg font-semibold">Send Pitch</DialogTitle>
        </DialogHeader>

        {connectionsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : !hasConnections ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">No email connected</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              Connect your Gmail account in Settings to send pitch emails.
            </p>
            <Button size="sm" onClick={() => navigate('/dashboard/settings')}>
              <Settings className="h-4 w-4 mr-2" />
              Go to Settings
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="compose" className="flex flex-col">
            <div className="px-6">
              <TabsList className="w-full grid grid-cols-2 h-9">
                <TabsTrigger value="compose" className="text-xs gap-1.5">
                  <PenLine className="h-3.5 w-3.5" />
                  Compose
                </TabsTrigger>
                <TabsTrigger value="preview" className="text-xs gap-1.5">
                  <Eye className="h-3.5 w-3.5" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Compose Tab */}
            <TabsContent value="compose" className="px-6 pb-2 mt-4 space-y-4">
              {/* Health Check */}
              {selectedConnection?.warmy_mailbox_id && (
                <SendHealthCheck 
                  connectionId={selectedConnectionId}
                  onReadinessChange={setCanSend}
                  compact={true}
                />
              )}

              {/* From */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">From</Label>
                <Select value={selectedConnectionId} onValueChange={setSelectedConnectionId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {connections.map(conn => (
                      <SelectItem key={conn.id} value={conn.id}>
                        <span className="flex items-center gap-2">
                          <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                          {conn.email_address}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* To + Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">To</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={to}
                    onChange={e => setTo(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</Label>
                  <Input
                    placeholder="Recipient name"
                    value={toName}
                    onChange={e => setToName(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Subject</Label>
                <Input
                  placeholder={isGenerating ? "Generating..." : "Subject line"}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="h-9"
                  disabled={isGenerating}
                />
              </div>

              {/* Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Message</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs gap-1.5"
                    onClick={generateCopy}
                    disabled={isGenerating || !pitchData}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3 w-3" />
                    )}
                    {isGenerating ? 'Writing...' : 'Regenerate'}
                  </Button>
                </div>

                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-8 border rounded-md bg-muted/30">
                    <Sparkles className="h-5 w-5 text-primary mb-2 animate-pulse" />
                    <p className="text-xs text-muted-foreground">Writing personalized email...</p>
                  </div>
                ) : (
                  <Textarea
                    placeholder="Your email message..."
                    value={bodyText}
                    onChange={e => setBodyText(e.target.value)}
                    className="min-h-[160px] text-sm leading-relaxed resize-none"
                  />
                )}
              </div>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="px-6 pb-2 mt-4">
              <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
                {/* Fake email header */}
                <div className="border-b bg-muted/30 px-4 py-2.5 space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium w-12">From</span>
                    <span className="text-foreground">{selectedConnection?.email_address || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium w-12">To</span>
                    <span className="text-foreground">{to || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground font-medium w-12">Subject</span>
                    <span className="text-foreground font-medium">{subject || '—'}</span>
                  </div>
                </div>
                {/* Email body */}
                <div 
                  className="p-4 text-sm max-h-[300px] overflow-y-auto"
                  dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
                />
              </div>
            </TabsContent>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t bg-muted/20">
              <div className="flex items-center justify-between w-full">
                <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSend} 
                  disabled={isSending || isGenerating || !to || !subject || !bodyText || (!canSend && !!selectedConnection?.warmy_mailbox_id)}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send
                </Button>
              </div>
            </DialogFooter>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
