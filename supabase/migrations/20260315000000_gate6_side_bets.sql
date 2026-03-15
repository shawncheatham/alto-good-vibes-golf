-- Gate 6: Side Bets
-- Creates side_bets and side_bet_results tables with RLS policies

-- =====================
-- TABLE: side_bets
-- =====================
CREATE TABLE side_bets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id     UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  bet_type     TEXT NOT NULL CHECK (bet_type IN ('hole', 'drive', 'pin', 'birdie', 'pressure')),
  amount       NUMERIC(8,2) NOT NULL CHECK (amount >= 0.05),
  hole_from    INT NOT NULL CHECK (hole_from BETWEEN 1 AND 18),
  hole_to      INT NOT NULL CHECK (hole_to BETWEEN 1 AND 18),
  player_ids   UUID[] NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_hole INT NOT NULL
);

-- =====================
-- TABLE: side_bet_results
-- =====================
CREATE TABLE side_bet_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  side_bet_id  UUID NOT NULL REFERENCES side_bets(id) ON DELETE CASCADE,
  hole         INT,
  winner_ids   UUID[],
  amount_won   NUMERIC(8,2),
  is_final     BOOLEAN DEFAULT FALSE
);

-- =====================
-- RLS: side_bets
-- =====================
ALTER TABLE side_bets ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT side bets for rounds they created
CREATE POLICY "side_bets_select" ON side_bets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = side_bets.round_id
        AND r.created_by = auth.uid()
    )
  );

-- Authenticated users can INSERT side bets for rounds they created
CREATE POLICY "side_bets_insert" ON side_bets
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rounds r
      WHERE r.id = side_bets.round_id
        AND r.created_by = auth.uid()
    )
  );

-- =====================
-- RLS: side_bet_results
-- =====================
ALTER TABLE side_bet_results ENABLE ROW LEVEL SECURITY;

-- Authenticated users can SELECT results for rounds they created
CREATE POLICY "side_bet_results_select" ON side_bet_results
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM side_bets sb
      JOIN rounds r ON r.id = sb.round_id
      WHERE sb.id = side_bet_results.side_bet_id
        AND r.created_by = auth.uid()
    )
  );

-- No INSERT/UPDATE policy for authenticated/anon — service role only writes results
