"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createUserClient } from "@/lib/supabase/server";

// Service-role admin client — used for all side_bet_results writes
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export type BetType = "hole" | "drive" | "pin" | "birdie" | "pressure";

export interface SideBet {
  id: string;
  round_id: string;
  bet_type: BetType;
  amount: number;
  hole_from: number;
  hole_to: number;
  player_ids: string[];
  created_at: string;
  created_hole: number;
  results?: SideBetResult[];
}

export interface SideBetResult {
  id: string;
  side_bet_id: string;
  hole: number | null;
  winner_ids: string[] | null;
  amount_won: number | null;
  is_final: boolean;
}

export interface SettlementEntry {
  playerId: string;
  netAmount: number;
  transactions: { from: string; to: string; amount: number }[];
}

// ============================================================
// createSideBet
// ============================================================
export async function createSideBet(
  roundId: string,
  betType: BetType,
  playerIds: string[],
  amount: number,
  holeFrom: number,
  holeTo: number
): Promise<{ data: SideBet | null; error: string | null }> {
  const supabase = await createUserClient();

  // Verify user is authenticated and players_club tier
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { data: null, error: "Not authenticated" };
  }

  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("tier")
    .eq("id", user.id)
    .single();

  if (userError || !userData) {
    return { data: null, error: "User not found" };
  }

  if (userData.tier !== "players_club") {
    return { data: null, error: "players_club tier required to add side bets" };
  }

  // Validate inputs
  if (amount < 0.05) {
    return { data: null, error: "Amount must be at least $0.05" };
  }
  if (playerIds.length < 2) {
    return { data: null, error: "At least 2 players required" };
  }
  if (holeFrom > holeTo) {
    return { data: null, error: "hole_from must be <= hole_to" };
  }

  // Determine created_hole from current round scores
  const { data: scores } = await supabase
    .from("score_entries")
    .select("hole, player_id")
    .eq("round_id", roundId);

  const { data: players } = await supabase
    .from("round_players")
    .select("id")
    .eq("round_id", roundId);

  let createdHole = 1;
  if (scores && players) {
    for (let h = 1; h <= 18; h++) {
      const holeEntries = scores.filter((e) => e.hole === h);
      if (holeEntries.length < players.length) {
        createdHole = h;
        break;
      }
      createdHole = h + 1;
    }
  }

  const { data, error } = await supabase
    .from("side_bets")
    .insert({
      round_id: roundId,
      bet_type: betType,
      amount,
      hole_from: holeFrom,
      hole_to: holeTo,
      player_ids: playerIds,
      created_hole: createdHole,
    })
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as SideBet, error: null };
}

// ============================================================
// getSideBets
// ============================================================
export async function getSideBets(
  roundId: string
): Promise<{ data: SideBet[]; error: string | null }> {
  const supabase = await createUserClient();

  const { data: bets, error: betsError } = await supabase
    .from("side_bets")
    .select("*")
    .eq("round_id", roundId)
    .order("created_at");

  if (betsError) {
    return { data: [], error: betsError.message };
  }

  if (!bets || bets.length === 0) {
    return { data: [], error: null };
  }

  const betIds = bets.map((b) => b.id);

  const { data: results, error: resultsError } = await supabase
    .from("side_bet_results")
    .select("*")
    .in("side_bet_id", betIds);

  if (resultsError) {
    return { data: bets as SideBet[], error: null };
  }

  const betsWithResults: SideBet[] = bets.map((bet) => ({
    ...bet,
    results: (results || []).filter((r) => r.side_bet_id === bet.id),
  }));

  return { data: betsWithResults, error: null };
}

// ============================================================
// calculateSideBetResults
// Auto-computes hole, birdie, pressure types.
// drive and pin are skipped (manual winner only).
// ============================================================
export async function calculateSideBetResults(
  roundId: string
): Promise<{ error: string | null }> {
  const supabase = await createUserClient();
  const admin = getAdminClient();

  const { data: bets, error: betsError } = await supabase
    .from("side_bets")
    .select("*")
    .eq("round_id", roundId);

  if (betsError || !bets || bets.length === 0) {
    return { error: null };
  }

  const { data: scores, error: scoresError } = await supabase
    .from("score_entries")
    .select("*")
    .eq("round_id", roundId);

  if (scoresError || !scores) {
    return { error: scoresError?.message ?? null };
  }

  const getScore = (playerId: string, hole: number) =>
    scores.find((s) => s.player_id === playerId && s.hole === hole)?.strokes ?? null;

  const allPlayersScored = (playerIds: string[], hole: number) =>
    playerIds.every((pid) => getScore(pid, hole) !== null);

  for (const bet of bets) {
    if (bet.bet_type === "drive" || bet.bet_type === "pin") {
      // Skip — manual winner only
      continue;
    }

    if (bet.bet_type === "hole") {
      // For each hole in range, find winner (lowest score). Ties carry over.
      let carryoverAmount = 0;
      for (let h = bet.hole_from; h <= bet.hole_to; h++) {
        if (!allPlayersScored(bet.player_ids, h)) continue;

        const holeScores = bet.player_ids
          .map((pid) => ({ pid, strokes: getScore(pid, h)! }))
          .filter((e) => e.strokes !== null);

        const minStrokes = Math.min(...holeScores.map((e) => e.strokes));
        const winners = holeScores.filter((e) => e.strokes === minStrokes);

        const potAmount = bet.amount + carryoverAmount;

        if (winners.length === holeScores.length) {
          // All tied — carry over
          carryoverAmount += bet.amount;
          await admin
            .from("side_bet_results")
            .upsert(
              {
                side_bet_id: bet.id,
                hole: h,
                winner_ids: null,
                amount_won: null,
                is_final: false,
              },
              { onConflict: "side_bet_id,hole" }
            );
        } else if (winners.length === 1) {
          carryoverAmount = 0;
          await admin
            .from("side_bet_results")
            .upsert(
              {
                side_bet_id: bet.id,
                hole: h,
                winner_ids: [winners[0].pid],
                amount_won: potAmount,
                is_final: true,
              },
              { onConflict: "side_bet_id,hole" }
            );
        } else {
          // Multiple non-all players tie: true tie among subset — carry over
          carryoverAmount += bet.amount;
          await admin
            .from("side_bet_results")
            .upsert(
              {
                side_bet_id: bet.id,
                hole: h,
                winner_ids: null,
                amount_won: null,
                is_final: false,
              },
              { onConflict: "side_bet_id,hole" }
            );
        }
      }
    }

    if (bet.bet_type === "birdie") {
      // For each hole in range, for each player: score <= 3 = birdie or better
      for (let h = bet.hole_from; h <= bet.hole_to; h++) {
        for (const pid of bet.player_ids) {
          const strokes = getScore(pid, h);
          if (strokes === null) continue;
          if (strokes <= 3) {
            await admin
              .from("side_bet_results")
              .upsert(
                {
                  side_bet_id: bet.id,
                  hole: h,
                  winner_ids: [pid],
                  amount_won: bet.amount,
                  is_final: true,
                },
                { onConflict: "side_bet_id,hole,winner_ids" }
              );
          }
        }
      }
    }

    if (bet.bet_type === "pressure") {
      // Single hole, best score wins
      const h = bet.hole_from;
      if (!allPlayersScored(bet.player_ids, h)) continue;

      const holeScores = bet.player_ids
        .map((pid) => ({ pid, strokes: getScore(pid, h)! }))
        .filter((e) => e.strokes !== null);

      const minStrokes = Math.min(...holeScores.map((e) => e.strokes));
      const winners = holeScores.filter((e) => e.strokes === minStrokes);

      if (winners.length === 1) {
        await admin
          .from("side_bet_results")
          .upsert(
            {
              side_bet_id: bet.id,
              hole: h,
              winner_ids: [winners[0].pid],
              amount_won: bet.amount * (bet.player_ids.length - 1),
              is_final: true,
            },
            { onConflict: "side_bet_id,hole" }
          );
      }
    }
  }

  return { error: null };
}

// ============================================================
// setManualWinner
// For drive/pin bets — saves winner via service role
// ============================================================
export async function setManualWinner(
  sideBetId: string,
  winnerIds: string[]
): Promise<{ data: SideBetResult | null; error: string | null }> {
  const admin = getAdminClient();

  // Get the bet to find the hole
  const { data: bet, error: betError } = await admin
    .from("side_bets")
    .select("*")
    .eq("id", sideBetId)
    .single();

  if (betError || !bet) {
    return { data: null, error: betError?.message ?? "Bet not found" };
  }

  const { data, error } = await admin
    .from("side_bet_results")
    .upsert(
      {
        side_bet_id: sideBetId,
        hole: bet.hole_from,
        winner_ids: winnerIds,
        amount_won: bet.amount * (bet.player_ids.length - 1),
        is_final: true,
      },
      { onConflict: "side_bet_id,hole" }
    )
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as SideBetResult, error: null };
}

// ============================================================
// getSettlementSummary
// Aggregates final results into per-player net amounts + transactions
// ============================================================
export async function getSettlementSummary(
  roundId: string
): Promise<{ data: SettlementEntry[]; error: string | null }> {
  const supabase = await createUserClient();

  const { data: bets, error: betsError } = await supabase
    .from("side_bets")
    .select("*")
    .eq("round_id", roundId);

  if (betsError || !bets || bets.length === 0) {
    return { data: [], error: null };
  }

  const betIds = bets.map((b) => b.id);

  const { data: results, error: resultsError } = await supabase
    .from("side_bet_results")
    .select("*")
    .in("side_bet_id", betIds)
    .eq("is_final", true);

  if (resultsError) {
    return { data: [], error: resultsError.message };
  }

  // Collect all unique player IDs across all bets
  const allPlayerIds = Array.from(new Set(bets.flatMap((b) => b.player_ids as string[])));

  // net amounts keyed by playerId
  const netMap: Record<string, number> = {};
  for (const pid of allPlayerIds) {
    netMap[pid] = 0;
  }

  // transactions list
  const transactions: { from: string; to: string; amount: number }[] = [];

  for (const result of results || []) {
    if (!result.winner_ids || result.winner_ids.length === 0) continue;

    const bet = bets.find((b) => b.id === result.side_bet_id);
    if (!bet) continue;

    const winners = result.winner_ids as string[];
    const losers = (bet.player_ids as string[]).filter((pid) => !winners.includes(pid));
    const amountWon = result.amount_won as number ?? 0;

    // Winners receive amountWon split among them
    const perWinner = amountWon / winners.length;
    for (const w of winners) {
      netMap[w] = (netMap[w] ?? 0) + perWinner;
    }

    // Losers pay equally
    const perLoser = amountWon / losers.length;
    for (const l of losers) {
      netMap[l] = (netMap[l] ?? 0) - perLoser;

      // Create transactions: each loser pays each winner proportionally
      const perWinnerFromThisLoser = perLoser / winners.length;
      for (const w of winners) {
        transactions.push({
          from: l,
          to: w,
          amount: Math.round(perWinnerFromThisLoser * 100) / 100,
        });
      }
    }
  }

  // Consolidate transactions by from/to pair
  const txMap: Record<string, number> = {};
  for (const tx of transactions) {
    const key = `${tx.from}:${tx.to}`;
    txMap[key] = (txMap[key] ?? 0) + tx.amount;
  }

  const consolidatedTxs = Object.entries(txMap).map(([key, amount]) => {
    const [from, to] = key.split(":");
    return { from, to, amount: Math.round(amount * 100) / 100 };
  });

  const entries: SettlementEntry[] = allPlayerIds.map((pid) => ({
    playerId: pid,
    netAmount: Math.round((netMap[pid] ?? 0) * 100) / 100,
    transactions: consolidatedTxs.filter((tx) => tx.from === pid || tx.to === pid),
  }));

  // Sort by net descending
  entries.sort((a, b) => b.netAmount - a.netAmount);

  return { data: entries, error: null };
}
