-- Add Warmy.io fields to email_connections table
ALTER TABLE public.email_connections
ADD COLUMN IF NOT EXISTS warmy_mailbox_id INTEGER,
ADD COLUMN IF NOT EXISTS warmy_state TEXT,
ADD COLUMN IF NOT EXISTS deliverability_score INTEGER,
ADD COLUMN IF NOT EXISTS placement_score INTEGER,
ADD COLUMN IF NOT EXISTS dns_score INTEGER,
ADD COLUMN IF NOT EXISTS warmy_temperature INTEGER,
ADD COLUMN IF NOT EXISTS last_warmy_sync TIMESTAMPTZ;

-- Add check constraints for score ranges
ALTER TABLE public.email_connections
ADD CONSTRAINT warmy_state_check CHECK (warmy_state IS NULL OR warmy_state IN ('active', 'paused', 'disconnected')),
ADD CONSTRAINT deliverability_score_check CHECK (deliverability_score IS NULL OR (deliverability_score >= 0 AND deliverability_score <= 100)),
ADD CONSTRAINT placement_score_check CHECK (placement_score IS NULL OR (placement_score >= 0 AND placement_score <= 100)),
ADD CONSTRAINT dns_score_check CHECK (dns_score IS NULL OR (dns_score >= 0 AND dns_score <= 100)),
ADD CONSTRAINT warmy_temperature_check CHECK (warmy_temperature IS NULL OR (warmy_temperature >= 0 AND warmy_temperature <= 100));