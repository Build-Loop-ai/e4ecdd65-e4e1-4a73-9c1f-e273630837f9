import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { GlowIcon } from '@/components/ui/GlowIcon';
import { Loader2, Save, Zap, Clock, Shield, MessageSquare, Sparkles } from 'lucide-react';
import { useOutreachSettings } from '@/hooks/useOutreachSettings';
import { useEmailConnections } from '@/hooks/useEmailConnections';
import { Skeleton } from '@/components/ui/skeleton';

export function OutreachSettings() {
  const { settings, isLoading, upsert, isSaving } = useOutreachSettings();
  const { connections } = useEmailConnections();

  const activeConnection = connections?.find(c => c.is_active);
  const warmyTemp = activeConnection?.warmy_temperature;
  const warmyLimit = activeConnection?.daily_send_limit;

  const getSuggestedCap = () => {
    if (warmyLimit && warmyLimit > 0) return warmyLimit;
    if (warmyTemp == null) return null;
    if (warmyTemp >= 90) return 50;
    if (warmyTemp >= 70) return 30;
    if (warmyTemp >= 50) return 20;
    if (warmyTemp >= 30) return 10;
    return 5;
  };

  const suggestedCap = getSuggestedCap();

  const [autoSend, setAutoSend] = useState(false);
  const [dailyCap, setDailyCap] = useState(20);
  const [windowStart, setWindowStart] = useState(9);
  const [windowEnd, setWindowEnd] = useState(17);
  const [followup, setFollowup] = useState(true);
  const [tone, setTone] = useState('professional');

  useEffect(() => {
    if (settings) {
      setAutoSend(settings.auto_send_enabled);
      setDailyCap(settings.daily_cap);
      setWindowStart(settings.send_window_start);
      setWindowEnd(settings.send_window_end);
      setFollowup(settings.followup_enabled);
      setTone(settings.tone);
    }
  }, [settings]);

  const handleSave = () => {
    upsert({
      auto_send_enabled: autoSend,
      daily_cap: dailyCap,
      send_window_start: windowStart,
      send_window_end: windowEnd,
      followup_enabled: followup,
      tone,
    });
  };

  const formatHour = (h: number) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hr = h % 12 || 12;
    return `${hr}:00 ${ampm}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Auto-Send Toggle */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlowIcon icon={Zap} variant="warning" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Auto-Pitch & Send</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically create pitches and send emails for every new lead with a website
              </p>
            </div>
          </div>
          <Switch checked={autoSend} onCheckedChange={setAutoSend} />
        </div>
      </div>

      {/* Daily Cap */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <GlowIcon icon={Shield} variant="success" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Send Cap</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Maximum emails per day (also respects warmup limits)
            </p>
          </div>
        </div>

        {suggestedCap !== null && (
          <div className="ml-12 flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <p className="text-xs text-foreground">
              Based on your warmup {warmyTemp != null ? `temperature (${warmyTemp}°)` : 'data'}, we suggest&nbsp;
              <button
                onClick={() => setDailyCap(suggestedCap)}
                className="font-semibold text-primary hover:underline"
              >
                {suggestedCap} emails/day
              </button>
            </p>
          </div>
        )}

        <div className="space-y-3 pl-12">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Max per day</span>
            <span className="text-sm font-medium text-foreground">{dailyCap}</span>
          </div>
          <Slider
            value={[dailyCap]}
            onValueChange={([v]) => setDailyCap(v)}
            min={1}
            max={50}
            step={1}
          />
        </div>
      </div>

      {/* Sending Window */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <GlowIcon icon={Clock} variant="info" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">Sending Window</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only send emails during these hours (your local time)
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pl-12">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">From</Label>
            <Select value={String(windowStart)} onValueChange={(v) => setWindowStart(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{formatHour(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">To</Label>
            <Select value={String(windowEnd)} onValueChange={(v) => setWindowEnd(Number(v))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 24 }, (_, i) => (
                  <SelectItem key={i} value={String(i)}>{formatHour(i)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Follow-Up Reminders */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GlowIcon icon={MessageSquare} variant="primary" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Follow-Up Reminders</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Get nudge suggestions when leads haven't opened your pitch
              </p>
            </div>
          </div>
          <Switch checked={followup} onCheckedChange={setFollowup} />
        </div>
      </div>

      {/* Default Tone */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Default Email Tone</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: 'casual', label: 'Casual', desc: 'Friendly, conversational' },
            { value: 'professional', label: 'Professional', desc: 'Polished, confident' },
            { value: 'bold', label: 'Bold', desc: 'Direct, assertive' },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => setTone(t.value)}
              className={`rounded-lg border p-3 text-left transition-colors ${
                tone === t.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <p className="text-sm font-medium text-foreground">{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2">
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        Save Outreach Settings
      </Button>
    </div>
  );
}
