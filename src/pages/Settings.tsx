import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Loader2, User, Globe, Linkedin, Twitter, Instagram, Mail, Save, 
  Camera, X, Flame, Settings as SettingsIcon, Zap, CreditCard
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EmailConnectionsSection } from '@/components/email/EmailConnectionCard';
import { WarmySection } from '@/components/email/WarmySection';
import { OutreachSettings } from '@/components/settings/OutreachSettings';
import { BillingSettings } from '@/components/settings/BillingSettings';
import { getEmailOAuthRedirectUri } from '@/lib/oauthRedirect';

interface CreatorProfile {
  full_name: string | null;
  avatar_url: string | null;
  business_name: string | null;
  tagline: string | null;
  website_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  instagram_url: string | null;
  public_email: string | null;
  show_branding: boolean;
}

export default function Settings() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [oauthProcessed, setOauthProcessed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<CreatorProfile>({
    full_name: '',
    avatar_url: '',
    business_name: '',
    tagline: '',
    website_url: '',
    linkedin_url: '',
    twitter_url: '',
    instagram_url: '',
    public_email: '',
    show_branding: true,
  });

  // Handle OAuth callback - only process once
  useEffect(() => {
    const oauthProvider = searchParams.get('oauth');
    const code = searchParams.get('code');
    
    if (oauthProvider && code && !oauthProcessed && (oauthProvider === 'gmail' || oauthProvider === 'outlook')) {
      setOauthProcessed(true);
      setSearchParams({}, { replace: true });
      
      const processCallback = async () => {
        try {
          const { data: session } = await supabase.auth.getSession();
          if (!session?.session?.access_token) {
            toast.error('No active session');
            return;
          }

          const redirectUri = getEmailOAuthRedirectUri(oauthProvider);
          const response = await supabase.functions.invoke('oauth-callback', {
            body: { provider: oauthProvider, code, redirect_uri: redirectUri },
          });

          if (response.error) {
            throw new Error(response.error.message || 'OAuth callback failed');
          }

          toast.success(`${oauthProvider === 'gmail' ? 'Gmail' : 'Outlook'} connected successfully!`);
        } catch (error: any) {
          console.error('OAuth callback error:', error);
          toast.error(error.message || 'Failed to connect email');
        }
      };
      
      processCallback();
    }
  }, [searchParams, setSearchParams, oauthProcessed]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        avatar_url: data.avatar_url || '',
        business_name: (data as any).business_name || '',
        tagline: (data as any).tagline || '',
        website_url: (data as any).website_url || '',
        linkedin_url: (data as any).linkedin_url || '',
        twitter_url: (data as any).twitter_url || '',
        instagram_url: (data as any).instagram_url || '',
        public_email: (data as any).public_email || '',
        show_branding: (data as any).show_branding ?? true,
      });
    }
    setLoading(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      setProfile(prev => ({ ...prev, avatar_url: urlWithCacheBuster }));
      toast.success('Avatar uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setProfile(prev => ({ ...prev, avatar_url: '' }));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name || null,
        avatar_url: profile.avatar_url || null,
        business_name: profile.business_name || null,
        tagline: profile.tagline || null,
        website_url: profile.website_url || null,
        linkedin_url: profile.linkedin_url || null,
        twitter_url: profile.twitter_url || null,
        instagram_url: profile.instagram_url || null,
        public_email: profile.public_email || null,
        show_branding: profile.show_branding,
      } as any)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to save settings');
    } else {
      toast.success('Settings saved!');
    }
    setSaving(false);
  };

  const updateField = (field: keyof CreatorProfile, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl space-y-8">
          <div>
            <Skeleton className="h-7 w-28 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="flex gap-6">
              <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your profile, email, warmup, and outreach preferences
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving} size="sm" className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="email" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Mail className="h-4 w-4" />
              Email
            </TabsTrigger>
            <TabsTrigger value="warmup" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Flame className="h-4 w-4" />
              Warmup
            </TabsTrigger>
            <TabsTrigger value="outreach" className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Zap className="h-4 w-4" />
              Outreach
            </TabsTrigger>
          </TabsList>

          {/* ── Profile Tab ── */}
          <TabsContent value="profile" className="space-y-6 mt-0">
            {/* Avatar + Identity */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-col sm:flex-row gap-6">
                {/* Avatar */}
                <div className="flex flex-col items-center gap-3 sm:items-start">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 ring-2 ring-border">
                      <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {profile.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 text-white animate-spin" />
                      ) : (
                        <Camera className="h-5 w-5 text-white" />
                      )}
                    </button>
                    {profile.avatar_url && (
                      <button
                        onClick={handleRemoveAvatar}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground">JPG, PNG. Max 5MB</p>
                </div>

                {/* Name fields */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="full_name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</Label>
                      <Input
                        id="full_name"
                        placeholder="John Doe"
                        value={profile.full_name || ''}
                        onChange={(e) => updateField('full_name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="business_name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Business</Label>
                      <Input
                        id="business_name"
                        placeholder="Acme Design Studio"
                        value={profile.business_name || ''}
                        onChange={(e) => updateField('business_name', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="tagline" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tagline</Label>
                    <Textarea
                      id="tagline"
                      placeholder="Crafting beautiful websites that convert visitors into customers"
                      value={profile.tagline || ''}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      className="resize-none"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Contact & Social</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { id: 'public_email', label: 'Email', icon: Mail, placeholder: 'hello@example.com', type: 'email' },
                  { id: 'website_url', label: 'Website', icon: Globe, placeholder: 'https://yourwebsite.com', type: 'url' },
                  { id: 'linkedin_url', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/...', type: 'url' },
                  { id: 'twitter_url', label: 'X / Twitter', icon: Twitter, placeholder: 'https://x.com/...', type: 'url' },
                  { id: 'instagram_url', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/...', type: 'url' },
                ].map(({ id, label, icon: Icon, placeholder, type }) => (
                  <div key={id} className="space-y-1.5">
                    <Label htmlFor={id} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </Label>
                    <Input
                      id={id}
                      type={type}
                      placeholder={placeholder}
                      value={(profile as any)[id] || ''}
                      onChange={(e) => updateField(id as keyof CreatorProfile, e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Branding toggle */}
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Creator Section</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Show your profile in the footer of pitch pages
                  </p>
                </div>
                <Switch
                  id="show-branding"
                  checked={profile.show_branding}
                  onCheckedChange={(checked) => updateField('show_branding', checked)}
                />
              </div>

              {/* Inline preview */}
              {profile.show_branding && (
                <div className="mt-4 bg-foreground/[0.03] dark:bg-white/[0.03] rounded-lg p-5 border border-border/50">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3">Preview</p>
                  <CreatorPreview profile={profile} />
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Billing Tab ── */}
          <TabsContent value="billing" className="mt-0">
            <BillingSettings />
          </TabsContent>

          {/* ── Email Tab ── */}
          <TabsContent value="email" className="mt-0">
            <EmailConnectionsSection />
          </TabsContent>

          {/* ── Warmup Tab ── */}
          <TabsContent value="warmup" className="mt-0">
            <WarmySection />
          </TabsContent>

          {/* ── Outreach Tab ── */}
          <TabsContent value="outreach" className="mt-0">
            <OutreachSettings />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Compact preview component
function CreatorPreview({ profile }: { profile: CreatorProfile }) {
  const hasLinks = profile.website_url || profile.linkedin_url || profile.twitter_url || profile.instagram_url;

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-12 w-12 border border-border">
        <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
        <AvatarFallback className="bg-primary/10 text-primary text-sm">
          {profile.full_name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {profile.full_name || 'Your Name'}
        </p>
        {profile.business_name && (
          <p className="text-xs text-muted-foreground truncate">{profile.business_name}</p>
        )}
      </div>
      {hasLinks && (
        <div className="flex items-center gap-1.5">
          {profile.website_url && <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
          {profile.linkedin_url && <Linkedin className="h-3.5 w-3.5 text-muted-foreground" />}
          {profile.twitter_url && <Twitter className="h-3.5 w-3.5 text-muted-foreground" />}
          {profile.instagram_url && <Instagram className="h-3.5 w-3.5 text-muted-foreground" />}
        </div>
      )}
    </div>
  );
}
