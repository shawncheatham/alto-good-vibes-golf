-- Rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_id TEXT,
  game TEXT NOT NULL DEFAULT 'skins',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'complete', 'abandoned')),
  holes INTEGER NOT NULL DEFAULT 18,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Players in a round
CREATE TABLE public.round_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Score entries
CREATE TABLE public.score_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.round_players(id) ON DELETE CASCADE,
  hole INTEGER NOT NULL CHECK (hole BETWEEN 1 AND 18),
  strokes INTEGER CHECK (strokes >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(round_id, player_id, hole)
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.round_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creator can manage round"
  ON public.rounds FOR ALL
  USING (auth.uid() = created_by);

CREATE POLICY "Creator can manage round players"
  ON public.round_players FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.rounds WHERE id = round_id AND created_by = auth.uid())
  );

CREATE POLICY "Creator can manage score entries"
  ON public.score_entries FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.rounds WHERE id = round_id AND created_by = auth.uid())
  );
