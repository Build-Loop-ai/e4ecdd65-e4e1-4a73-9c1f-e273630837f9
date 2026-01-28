import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailConnection {
  id: string;
  user_id: string;
  provider: 'gmail' | 'outlook';
  email_address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useEmailConnections() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<EmailConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const fetchConnections = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('email_connections')
        .select('id, user_id, provider, email_address, is_active, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConnections((data as EmailConnection[]) || []);
    } catch (error: any) {
      console.error('Error fetching email connections:', error);
      toast.error('Failed to load email connections');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const getActiveConnection = useCallback(() => {
    return connections.find(c => c.is_active);
  }, [connections]);

  const getGoogleOAuthUrl = useCallback(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google OAuth not configured');
      return null;
    }

    const redirectUri = `${window.location.origin}/settings?oauth=gmail`;
    const scope = encodeURIComponent('https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/userinfo.email');
    
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  }, []);

  const getMicrosoftOAuthUrl = useCallback(() => {
    const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
    if (!clientId) {
      toast.error('Microsoft OAuth not configured');
      return null;
    }

    const redirectUri = `${window.location.origin}/settings?oauth=outlook`;
    const scope = encodeURIComponent('https://graph.microsoft.com/Mail.Send offline_access openid email');
    
    return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}`;
  }, []);

  const handleOAuthCallback = useCallback(async (provider: 'gmail' | 'outlook', code: string) => {
    if (!user) return false;

    setIsConnecting(true);
    
    try {
      const redirectUri = `${window.location.origin}/settings?oauth=${provider}`;
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error('No active session');
      }

      const response = await supabase.functions.invoke('oauth-callback', {
        body: { provider, code, redirect_uri: redirectUri },
      });

      if (response.error) {
        throw new Error(response.error.message || 'OAuth callback failed');
      }

      toast.success(`${provider === 'gmail' ? 'Gmail' : 'Outlook'} connected successfully!`);
      await fetchConnections();
      return true;
    } catch (error: any) {
      console.error('OAuth callback error:', error);
      toast.error(error.message || 'Failed to connect email');
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [user, fetchConnections]);

  const disconnectEmail = useCallback(async (connectionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('email_connections')
        .delete()
        .eq('id', connectionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Email disconnected');
      await fetchConnections();
    } catch (error: any) {
      console.error('Disconnect error:', error);
      toast.error('Failed to disconnect email');
    }
  }, [user, fetchConnections]);

  const sendTestEmail = useCallback(async (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return;

    try {
      // Create a test preview ID (we'll use a fake one for testing)
      const response = await supabase.functions.invoke('send-email', {
        body: {
          to: connection.email_address,
          toName: 'Test',
          subject: 'Pitch - Test Email Connection',
          bodyHtml: `
            <html>
              <body style="font-family: system-ui; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>🎉 Your email is connected!</h2>
                <p>This is a test email to confirm your ${connection.provider === 'gmail' ? 'Gmail' : 'Outlook'} connection is working correctly.</p>
                <p>You can now send pitch emails directly from the Pitch platform.</p>
              </body>
            </html>
          `,
          previewId: '00000000-0000-0000-0000-000000000000', // Placeholder for test
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success('Test email sent! Check your inbox.');
    } catch (error: any) {
      console.error('Test email error:', error);
      toast.error(error.message || 'Failed to send test email');
    }
  }, [connections]);

  return {
    connections,
    isLoading,
    isConnecting,
    getActiveConnection,
    getGoogleOAuthUrl,
    getMicrosoftOAuthUrl,
    handleOAuthCallback,
    disconnectEmail,
    sendTestEmail,
    refetch: fetchConnections,
  };
}
