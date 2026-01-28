import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, User, Globe, Linkedin, Twitter, Instagram, Mail, Save, Upload, X, Camera } from 'lucide-react';
import { EmailConnectionsSection } from '@/components/email/EmailConnectionCard';
import { useEmailConnections } from '@/hooks/useEmailConnections';

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
  const { handleOAuthCallback } = useEmailConnections();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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

  // Handle OAuth callback
  useEffect(() => {
    const oauthProvider = searchParams.get('oauth');
    const code = searchParams.get('code');
    
    if (oauthProvider && code && (oauthProvider === 'gmail' || oauthProvider === 'outlook')) {
      // Clear the URL params
      setSearchParams({});
      // Process the callback
      handleOAuthCallback(oauthProvider, code);
    }
  }, [searchParams, setSearchParams, handleOAuthCallback]);

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

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          upsert: true,
          cacheControl: '3600',
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;
      
      // Update profile state
      setProfile(prev => ({ ...prev, avatar_url: urlWithCacheBuster }));
      toast.success('Avatar uploaded successfully!');
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
      toast.success('Settings saved successfully!');
    }
    setSaving(false);
  };

  const updateField = (field: keyof CreatorProfile, value: string | boolean) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your creator profile that appears on your pitch pages
          </p>
        </div>

        {/* Creator Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Creator Profile
            </CardTitle>
            <CardDescription>
              This information will be displayed in the footer of your pitch pages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show Branding Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <Label htmlFor="show-branding" className="text-base font-medium">
                  Show Creator Section
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Display your profile in the footer of pitch pages
                </p>
              </div>
              <Switch
                id="show-branding"
                checked={profile.show_branding}
                onCheckedChange={(checked) => updateField('show_branding', checked)}
              />
            </div>

            <Separator />

            {/* Avatar & Name Row */}
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                {/* Avatar with Upload */}
                <div className="relative group">
                  <Avatar className="h-24 w-24 ring-2 ring-border">
                    <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {profile.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Upload Overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {uploading ? (
                      <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                      <Camera className="h-6 w-6 text-white" />
                    )}
                  </button>

                  {/* Remove button */}
                  {profile.avatar_url && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />

                {/* Upload Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  {uploading ? 'Uploading...' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  JPG, PNG or GIF. Max 5MB.
                </p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Your Name</Label>
                    <Input
                      id="full_name"
                      placeholder="John Doe"
                      value={profile.full_name || ''}
                      onChange={(e) => updateField('full_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="business_name">Business / Agency Name</Label>
                    <Input
                      id="business_name"
                      placeholder="Acme Design Studio"
                      value={profile.business_name || ''}
                      onChange={(e) => updateField('business_name', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Textarea
                    id="tagline"
                    placeholder="Crafting beautiful websites that convert visitors into customers"
                    value={profile.tagline || ''}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    className="mt-1 resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Links Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Contact & Social Links</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="public_email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Public Email
                  </Label>
                  <Input
                    id="public_email"
                    type="email"
                    placeholder="hello@example.com"
                    value={profile.public_email || ''}
                    onChange={(e) => updateField('public_email', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="website_url" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Website
                  </Label>
                  <Input
                    id="website_url"
                    type="url"
                    placeholder="https://yourwebsite.com"
                    value={profile.website_url || ''}
                    onChange={(e) => updateField('website_url', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin_url" className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Label>
                  <Input
                    id="linkedin_url"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={profile.linkedin_url || ''}
                    onChange={(e) => updateField('linkedin_url', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter_url" className="flex items-center gap-2">
                    <Twitter className="h-4 w-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter_url"
                    type="url"
                    placeholder="https://twitter.com/..."
                    value={profile.twitter_url || ''}
                    onChange={(e) => updateField('twitter_url', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram_url" className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram_url"
                    type="url"
                    placeholder="https://instagram.com/..."
                    value={profile.instagram_url || ''}
                    onChange={(e) => updateField('instagram_url', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Save Button */}
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Settings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Email Integrations Section */}
        <EmailConnectionsSection />

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              This is how your creator section will appear on pitch pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 rounded-xl p-6 sm:p-8">
              <CreatorPreview profile={profile} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// Preview component to show how the footer will look
function CreatorPreview({ profile }: { profile: CreatorProfile }) {
  if (!profile.show_branding) {
    return (
      <p className="text-slate-400 text-center py-4">
        Creator section is hidden
      </p>
    );
  }

  const hasLinks = profile.website_url || profile.linkedin_url || profile.twitter_url || profile.instagram_url;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 text-white">
      <Avatar className="h-16 w-16 border-2 border-white/20">
        <AvatarImage src={profile.avatar_url || undefined} className="object-cover" />
        <AvatarFallback className="bg-white/10 text-white text-lg">
          {profile.full_name?.charAt(0) || '?'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 text-center sm:text-left">
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
          Created by
        </p>
        <h4 className="text-lg font-semibold text-white">
          {profile.full_name || 'Your Name'}
        </h4>
        {profile.business_name && (
          <p className="text-slate-300 text-sm">
            {profile.business_name}
          </p>
        )}
        {profile.tagline && (
          <p className="text-slate-400 text-sm mt-1 max-w-md">
            {profile.tagline}
          </p>
        )}
      </div>

      {hasLinks && (
        <div className="flex items-center gap-3">
          {profile.website_url && (
            <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
              <Globe className="h-5 w-5" />
            </div>
          )}
          {profile.linkedin_url && (
            <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
              <Linkedin className="h-5 w-5" />
            </div>
          )}
          {profile.twitter_url && (
            <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
              <Twitter className="h-5 w-5" />
            </div>
          )}
          {profile.instagram_url && (
            <div className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer">
              <Instagram className="h-5 w-5" />
            </div>
          )}
        </div>
      )}

      {profile.public_email && (
        <div className="hidden sm:block">
          <Button 
            variant="outline" 
            size="sm"
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact
          </Button>
        </div>
      )}
    </div>
  );
}
