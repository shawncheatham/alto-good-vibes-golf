export interface ScoreEntry {
  player_id: string;
  hole: number;
  strokes: number | null;
}

export interface Player {
  id: string;
  name: string;
  position: number;
}

export interface LedgerEntry {
  playerId: string;
  name: string;
  skins?: number;
  ties?: number;
  points?: number;
  front?: number;
  back?: number;
  total?: number;
  matchScore?: number;
}

export interface LedgerState {
  entries: LedgerEntry[];
  carryover?: number;
  matchResult?: string;
  holeWinners?: { hole: number; player_id: string; strokes: number; multiplier?: number }[];
}

// ─── Skins ────────────────────────────────────────────────────────────────────

export function calculateSkins(scores: ScoreEntry[], players: Player[]): LedgerState {
  let carryover = 0;
  const skinsByPlayer: Record<string, number> = {};
  const tiesByPlayer: Record<string, number> = {};
  const holeWinners: { hole: number; player_id: string; strokes: number }[] = [];

  for (let hole = 1; hole <= 18; hole++) {
    const holeScores = scores.filter(s => s.hole === hole && s.strokes != null);
    if (holeScores.length < players.length) { carryover++; continue; }

    const minScore = Math.min(...holeScores.map(s => s.strokes as number));
    const winners = holeScores.filter(s => s.strokes === minScore);

    if (winners.length === 1) {
      const won = 1 + carryover;
      skinsByPlayer[winners[0].player_id] = (skinsByPlayer[winners[0].player_id] || 0) + won;
      holeWinners.push({ hole, player_id: winners[0].player_id, strokes: winners[0].strokes as number });
      carryover = 0;
    } else {
      winners.forEach(w => { tiesByPlayer[w.player_id] = (tiesByPlayer[w.player_id] || 0) + 1; });
      carryover++;
    }
  }

  const entries: LedgerEntry[] = players.map(p => ({
    playerId: p.id,
    name: p.name,
    skins: skinsByPlayer[p.id] || 0,
    ties: tiesByPlayer[p.id] || 0,
  })).sort((a, b) => (b.skins ?? 0) - (a.skins ?? 0));

  return { entries, carryover, holeWinners };
}

// ─── Nassau ───────────────────────────────────────────────────────────────────

export function calculateNassau(scores: ScoreEntry[], players: Player[]): LedgerState {
  const totals: Record<string, { front: number; back: number; total: number }> = {};

  for (const p of players) {
    totals[p.id] = { front: 0, back: 0, total: 0 };
    for (let hole = 1; hole <= 18; hole++) {
      const s = scores.find(e => e.player_id === p.id && e.hole === hole);
      if (s?.strokes != null) {
        totals[p.id].total += s.strokes;
        if (hole <= 9) totals[p.id].front += s.strokes;
        else totals[p.id].back += s.strokes;
      }
    }
  }

  // Count completed holes per segment to determine winners
  const frontComplete = players.every(p => {
    const count = scores.filter(s => s.player_id === p.id && s.hole <= 9 && s.strokes != null).length;
    return count === 9;
  });
  const backComplete = players.every(p => {
    const count = scores.filter(s => s.player_id === p.id && s.hole > 9 && s.strokes != null).length;
    return count === 9;
  });
  const totalComplete = frontComplete && backComplete;

  // Wins = lower total for each segment (1 = won, 0 = lost/tied)
  const frontMin = frontComplete ? Math.min(...players.map(p => totals[p.id].front)) : null;
  const backMin = backComplete ? Math.min(...players.map(p => totals[p.id].back)) : null;
  const totalMin = totalComplete ? Math.min(...players.map(p => totals[p.id].total)) : null;

  const entries: LedgerEntry[] = players.map(p => {
    const t = totals[p.id];
    let wins = 0;
    if (frontComplete && frontMin !== null && t.front === frontMin) {
      const tiedCount = players.filter(x => totals[x.id].front === frontMin).length;
      if (tiedCount === 1) wins++;
    }
    if (backComplete && backMin !== null && t.back === backMin) {
      const tiedCount = players.filter(x => totals[x.id].back === backMin).length;
      if (tiedCount === 1) wins++;
    }
    if (totalComplete && totalMin !== null && t.total === totalMin) {
      const tiedCount = players.filter(x => totals[x.id].total === totalMin).length;
      if (tiedCount === 1) wins++;
    }
    return {
      playerId: p.id,
      name: p.name,
      front: t.front || undefined,
      back: t.back || undefined,
      total: t.total || undefined,
      skins: wins, // repurpose skins field for wins count
    };
  }).sort((a, b) => (b.skins ?? 0) - (a.skins ?? 0));

  return { entries };
}

// ─── Match Play ───────────────────────────────────────────────────────────────

export function calculateMatchPlay(scores: ScoreEntry[], players: Player[]): LedgerState {
  if (players.length < 2) return { entries: players.map(p => ({ playerId: p.id, name: p.name, matchScore: 0 })) };

  const p1 = players[0];
  const p2 = players[1];
  let p1Score = 0; // positive = p1 leads, negative = p2 leads
  const holeWinners: { hole: number; player_id: string; strokes: number }[] = [];

  for (let hole = 1; hole <= 18; hole++) {
    const s1 = scores.find(s => s.player_id === p1.id && s.hole === hole);
    const s2 = scores.find(s => s.player_id === p2.id && s.hole === hole);
    if (s1?.strokes == null || s2?.strokes == null) continue;

    if (s1.strokes < s2.strokes) {
      p1Score++;
      holeWinners.push({ hole, player_id: p1.id, strokes: s1.strokes });
    } else if (s2.strokes < s1.strokes) {
      p1Score--;
      holeWinners.push({ hole, player_id: p2.id, strokes: s2.strokes });
    }
    // tie = halve, no change
  }

  // Build match result string
  const holesPlayed = scores
    .filter(s => s.strokes != null)
    .reduce((acc, s) => {
      acc.add(s.hole);
      return acc;
    }, new Set<number>()).size;
  const holesRemaining = 18 - holesPlayed;
  const absScore = Math.abs(p1Score);
  const leader = p1Score > 0 ? p1 : p1Score < 0 ? p2 : null;

  let matchResult = 'All Square';
  if (leader) {
    if (absScore > holesRemaining) {
      matchResult = `${leader.name} wins ${absScore}&${holesRemaining}`;
    } else {
      matchResult = `${leader.name} leads ${absScore} up`;
    }
  }

  const entries: LedgerEntry[] = [
    { playerId: p1.id, name: p1.name, matchScore: p1Score },
    { playerId: p2.id, name: p2.name, matchScore: -p1Score },
  ].sort((a, b) => (b.matchScore ?? 0) - (a.matchScore ?? 0));

  return { entries, matchResult, holeWinners };
}

// ─── Stableford ───────────────────────────────────────────────────────────────

const PAR = 4; // Placeholder par for all holes

export function calculateStableford(scores: ScoreEntry[], players: Player[]): LedgerState {
  const pointsByPlayer: Record<string, number> = {};

  for (const p of players) {
    pointsByPlayer[p.id] = 0;
    for (let hole = 1; hole <= 18; hole++) {
      const s = scores.find(e => e.player_id === p.id && e.hole === hole);
      if (s?.strokes == null) continue;
      const diff = s.strokes - PAR;
      let pts = 0;
      if (diff <= -2) pts = 4;       // Eagle or better
      else if (diff === -1) pts = 3; // Birdie
      else if (diff === 0) pts = 2;  // Par
      else if (diff === 1) pts = 1;  // Bogey
      else pts = 0;                   // Double bogey+
      pointsByPlayer[p.id] += pts;
    }
  }

  const entries: LedgerEntry[] = players.map(p => ({
    playerId: p.id,
    name: p.name,
    points: pointsByPlayer[p.id] || 0,
  })).sort((a, b) => (b.points ?? 0) - (a.points ?? 0));

  return { entries };
}

// ─── Wolf ─────────────────────────────────────────────────────────────────────

export function calculateWolf(
  scores: ScoreEntry[],
  players: Player[],
  metadata?: { wolfChoices?: Record<number, string | 'lone'> }
): LedgerState {
  // For MVP: fall back to skins standings (wolf choices handled via UI later)
  const skinsResult = calculateSkins(scores, players);
  return skinsResult;
}

// ─── Chaos Skins ─────────────────────────────────────────────────────────────

export function calculateChaosSkins(
  scores: ScoreEntry[],
  players: Player[],
  multipliers: number[]
): LedgerState {
  let carryover = 0;
  const skinsByPlayer: Record<string, number> = {};
  const tiesByPlayer: Record<string, number> = {};
  const holeWinners: { hole: number; player_id: string; strokes: number; multiplier?: number }[] = [];

  for (let hole = 1; hole <= 18; hole++) {
    const holeScores = scores.filter(s => s.hole === hole && s.strokes != null);
    if (holeScores.length < players.length) { carryover++; continue; }

    const mult = multipliers[hole - 1] ?? 1;
    const minScore = Math.min(...holeScores.map(s => s.strokes as number));
    const winners = holeScores.filter(s => s.strokes === minScore);

    if (winners.length === 1) {
      const won = (1 + carryover) * mult;
      skinsByPlayer[winners[0].player_id] = (skinsByPlayer[winners[0].player_id] || 0) + won;
      holeWinners.push({ hole, player_id: winners[0].player_id, strokes: winners[0].strokes as number, multiplier: mult });
      carryover = 0;
    } else {
      winners.forEach(w => { tiesByPlayer[w.player_id] = (tiesByPlayer[w.player_id] || 0) + 1; });
      carryover++;
    }
  }

  const entries: LedgerEntry[] = players.map(p => ({
    playerId: p.id,
    name: p.name,
    skins: skinsByPlayer[p.id] || 0,
    ties: tiesByPlayer[p.id] || 0,
  })).sort((a, b) => (b.skins ?? 0) - (a.skins ?? 0));

  return { entries, carryover, holeWinners };
}

// ─── Custom ───────────────────────────────────────────────────────────────────

export function calculateCustom(
  scores: ScoreEntry[],
  players: Player[],
  customRules?: { base_game?: string }
): LedgerState {
  const baseGame = customRules?.base_game || 'skins';
  if (baseGame === 'nassau') return calculateNassau(scores, players);
  if (baseGame === 'matchplay') return calculateMatchPlay(scores, players);
  if (baseGame === 'stableford') return calculateStableford(scores, players);
  if (baseGame === 'wolf') return calculateWolf(scores, players);
  if (baseGame === 'chaosskins') return calculateChaosSkins(scores, players, []);
  return calculateSkins(scores, players);
}

// ─── Main dispatcher ──────────────────────────────────────────────────────────

export function calculateStandings(
  gameId: string,
  scores: ScoreEntry[],
  players: Player[],
  options?: {
    customRules?: Record<string, unknown>;
    multipliers?: number[];
    wolfChoices?: Record<number, string | 'lone'>;
  }
): LedgerState {
  switch (gameId) {
    case 'nassau':
      return calculateNassau(scores, players);
    case 'matchplay':
      return calculateMatchPlay(scores, players);
    case 'stableford':
      return calculateStableford(scores, players);
    case 'wolf':
      return calculateWolf(scores, players, { wolfChoices: options?.wolfChoices });
    case 'chaosskins':
      return calculateChaosSkins(scores, players, options?.multipliers || []);
    case 'custom':
      return calculateCustom(scores, players, options?.customRules as { base_game?: string });
    default:
      return calculateSkins(scores, players);
  }
}
