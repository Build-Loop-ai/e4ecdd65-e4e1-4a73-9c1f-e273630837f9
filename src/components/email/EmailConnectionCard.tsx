import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Check, 
  X, 
  Loader2, 
  ExternalLink,
  Send,
  Trash2
} from 'lucide-react';
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
import { useEmailConnections, type EmailConnection } from '@/hooks/useEmailConnections';
import { format } from 'date-fns';

// Gmail icon
function GmailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="currentColor"/>
    </svg>
  );
}

// Outlook icon
function OutlookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
      <path d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z" fill="currentColor"/>
    </svg>
  );
}

interface ProviderCardProps {
  provider: 'gmail' | 'outlook';
  connection?: EmailConnection;
  onConnect: () => void;
  onDisconnect: (id: string) => void;
  onSendTest: (id: string) => void;
  isConnecting: boolean;
  comingSoon?: boolean;
}

function ProviderCard({ 
  provider, 
  connection, 
  onConnect, 
  onDisconnect, 
  onSendTest,
  isConnecting,
  comingSoon = false
}: ProviderCardProps) {
  const [isSendingTest, setIsSendingTest] = useState(false);

  const isGmail = provider === 'gmail';
  const Icon = isGmail ? GmailIcon : OutlookIcon;
  const name = isGmail ? 'Gmail' : 'Outlook';
  const description = isGmail 
    ? 'Send emails from your Google account' 
    : 'Send emails from your Microsoft account';

  const handleSendTest = async () => {
    if (!connection) return;
    setIsSendingTest(true);
    try {
      await onSendTest(connection.id);
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <Card className={`${connection?.is_active ? 'border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20' : ''} ${comingSoon ? 'opacity-60' : ''}`}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isGmail ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                {name}
                {comingSoon && (
                  <Badge variant="outline" className="text-xs">
                    Coming Soon
                  </Badge>
                )}
                {connection?.is_active && !comingSoon && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <Check className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </h4>
              <p className="text-sm text-muted-foreground">
                {connection && !comingSoon ? connection.email_address : description}
              </p>
              {connection && !comingSoon && (
                <p className="text-xs text-muted-foreground mt-1">
                  Connected {format(new Date(connection.created_at), 'MMM d, yyyy')}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {comingSoon ? (
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect {name}
              </Button>
            ) : connection ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSendTest}
                  disabled={isSendingTest}
                >
                  {isSendingTest ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Test
                    </>
                  )}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Disconnect {name}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove access to {connection.email_address}. You won't be able to send emails from this account until you reconnect.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDisconnect(connection.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Disconnect
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button
                variant={isGmail ? 'default' : 'outline'}
                onClick={onConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Connect {name}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function EmailConnectionsSection() {
  const {
    connections,
    isLoading,
    isConnecting,
    getGoogleOAuthUrl,
    getMicrosoftOAuthUrl,
    disconnectEmail,
    sendTestEmail,
  } = useEmailConnections();

  const gmailConnection = connections.find(c => c.provider === 'gmail');
  const outlookConnection = connections.find(c => c.provider === 'outlook');

  const handleConnectGmail = async () => {
    const url = await getGoogleOAuthUrl();
    if (url) window.location.href = url;
  };

  const handleConnectOutlook = async () => {
    const url = await getMicrosoftOAuthUrl();
    if (url) window.location.href = url;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Integrations
        </CardTitle>
        <CardDescription>
          Connect your email to send pitch emails directly from the platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProviderCard
          provider="gmail"
          connection={gmailConnection}
          onConnect={handleConnectGmail}
          onDisconnect={disconnectEmail}
          onSendTest={sendTestEmail}
          isConnecting={isConnecting}
        />

        <Separator />

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Note:</strong> Your email credentials are securely stored and only used to send emails and manage warmup on your behalf.
          </p>
          <p>
            Full mailbox access is required for the warmup service to improve your sender reputation. Your data is never shared with third parties.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
