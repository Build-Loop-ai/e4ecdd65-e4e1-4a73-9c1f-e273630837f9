-- Add new columns to email_connections for smart sending tracking
ALTER TABLE email_connections 
  ADD COLUMN IF NOT EXISTS daily_send_limit integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS emails_sent_today integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_send_count_reset timestamp with time zone DEFAULT now(),
  ADD COLUMN IF NOT EXISTS warmup_started_at timestamp with time zone;