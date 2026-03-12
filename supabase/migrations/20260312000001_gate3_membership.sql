ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'grounds_keeper', 'players_club')),
ADD COLUMN IF NOT EXISTS bmc_supporter_id TEXT,
ADD COLUMN IF NOT EXISTS tier_updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_bmc_supporter_id ON public.users(bmc_supporter_id);
