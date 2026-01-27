import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MessageSquare, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getButtonTextColor } from '@/lib/colorContrast';

interface FeedbackButtonProps {
  previewId: string;
  primaryColor?: string;
}

export function FeedbackButton({ previewId, primaryColor }: FeedbackButtonProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.currentTarget);

    const { error } = await supabase.from('client_feedback').insert({
      preview_id: previewId,
      client_name: formData.get('name') as string || null,
      client_email: formData.get('email') as string || null,
      feedback_text: formData.get('feedback') as string,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      await supabase
        .from('client_previews')
        .update({ status: 'feedback_received' })
        .eq('id', previewId);

      toast({
        title: 'Feedback verzonden!',
        description: 'Bedankt voor je feedback. We nemen het mee.',
      });
      setOpen(false);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg" 
            className="shadow-2xl hover:shadow-xl transition-all duration-300 rounded-full px-6"
            style={{ 
              backgroundColor: primaryColor || 'hsl(var(--primary))',
              color: getButtonTextColor(primaryColor || '#6366F1')
            }}
          >
            <MessageSquare className="h-5 w-5 mr-2" />
            Wijzigingen aanvragen
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wijzigingen aanvragen</DialogTitle>
            <DialogDescription>
              Laat ons weten welke aanpassingen je wilt zien op je nieuwe website
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Je naam (optioneel)</Label>
              <Input id="name" name="name" placeholder="Jan Jansen" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail (optioneel)</Label>
              <Input id="email" name="email" type="email" placeholder="jan@voorbeeld.nl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="feedback">Wat wil je aanpassen?</Label>
              <Textarea
                id="feedback"
                name="feedback"
                placeholder="Ik wil graag de hero tekst aanpassen en meer diensten toevoegen..."
                required
                rows={4}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={submitting}
              style={{ 
                backgroundColor: primaryColor || 'hsl(var(--primary))',
                color: 'white'
              }}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verstuur feedback
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
