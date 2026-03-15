"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateStandings } from "@/lib/scoring";
import { GAMES, GameId } from "@/lib/games";
import { getSideBets, getSettlementSummary, SideBet, SettlementEntry } from "@/lib/actions/sideBets";

interface Round {
  id: string;
  course_name: string;
  game: string;
  game_id?: string;
  game_label?: string;
  custom_rules?: Record<string, unknown> | null;
  metadata?: { chaosMultipliers?: number[] } | null;
  status: string;
  holes: number;
}

interface Player {
  id: string;
  name: string;
  position: number;
}

interface ScoreEntry {
  id: string;
  player_id: string;
  hole: number;
  strokes: number | null;
}

export default function LedgerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [sideBets, setSideBets] = useState<SideBet[]>([]);
  const [settlement, setSettlement] = useState<SettlementEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: r }, { data: p }, { data: s }] = await Promise.all([
        supabase.from("rounds").select("*").eq("id", id).single(),
        supabase.from("round_players").select("*").eq("round_id", id).order("position"),
        supabase.from("score_entries").select("*").eq("round_id", id),
      ]);
      if (r) setRound(r);
      if (p) setPlayers(p);
      if (s) setScores(s);

      const [{ data: bets }, { data: settle }] = await Promise.all([
        getSideBets(id as string),
        getSettlementSummary(id as string),
      ]);
      if (bets) setSideBets(bets);
      if (settle) setSettlement(settle);

      setLoading(false);
    };
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--gvg-gray-500)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
          <p>Loading ledger...</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", padding: 32 }}>
        <p>Round not found.</p>
      </div>
    );
  }

  const gameId = round.game_id || round.game || "skins";
  const gameDisplayName = round.game_label || (GAMES[gameId as GameId]?.name ?? "Skins");

  const ledgerState = calculateStandings(gameId, scores, players, {
    customRules: round.custom_rules ?? undefined,
    multipliers: round.metadata?.chaosMultipliers,
  });
  const { entries, carryover, matchResult } = ledgerState;

  // Determine how many holes are complete (for display)
  let lastCompleteHole = 0;
  for (let h = 1; h <= 18; h++) {
    const holeEntries = scores.filter((e) => e.hole === h);
    if (holeEntries.length >= players.length) {
      lastCompleteHole = h;
    } else {
      break;
    }
  }

  const getBetIcon = (bt: string) => {
    const map: Record<string, string> = { hole: "🏌️", drive: "💥", pin: "🎯", birdie: "🐦", pressure: "🔥" };
    return map[bt] ?? "🎲";
  };

  const getBetName = (bet: SideBet) => {
    const names: Record<string, string> = {
      hole: "Bet on Each Hole",
      drive: "Longest Drive",
      pin: "Closest to the Pin",
      birdie: "Birdie or Better Bonus",
      pressure: "Last Hole Pressure",
    };
    return names[bet.bet_type] ?? bet.bet_type;
  };

  const getBetStatus = (bet: SideBet) => {
    const totalHoles = bet.hole_to - bet.hole_from + 1;
    const finalResults = (bet.results ?? []).filter((r) => r.is_final);
    if (finalResults.length === 0) return "In progress";
    if (finalResults.length >= totalHoles) return "Complete";
    return `${finalResults.length}/${totalHoles} holes done`;
  };

  // Per-player net from side bets only
  const getPlayerNetFromBets = (playerId: string): number => {
    const entry = settlement.find((e) => e.playerId === playerId);
    return entry?.netAmount ?? 0;
  };

  // Overall net per player (side bets only for now — main game has no $ amount)
  const overallNets = players.map((p) => ({
    player: p,
    skins: entries.find((e) => e.playerId === p.id)?.skins ?? 0,
    betNet: getPlayerNetFromBets(p.id),
  }));
  overallNets.sort((a, b) => b.betNet - a.betNet);

  const hasSideBets = sideBets.length > 0;
  const hasSettlement = settlement.length > 0 && settlement.some((e) => e.netAmount !== 0);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--gvg-white)", minHeight: "100vh", boxShadow: "var(--gvg-shadow-lg)" }}>
      {/* Header */}
      <header style={{ background: "var(--gvg-grass-dark)", color: "white", padding: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--gvg-shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Ledger</h1>
            <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              {gameDisplayName}
              {sideBets.length > 0 && (
                <span style={{ background: "rgba(249,115,22,0.9)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 999, marginLeft: 6 }}>
                  🎲 {sideBets.length} side bet{sideBets.length !== 1 ? "s" : ""}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => router.push(`/round/${id}/scorecard`)}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            ← Back
          </button>
        </div>
      </header>

      <main style={{ padding: 16, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Overall Totals card (only shown when side bets exist with settlement data) */}
        {hasSideBets && hasSettlement && (
          <div style={{ background: "var(--gvg-white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <div style={{ padding: "16px 20px", background: "#1a3a2a", display: "flex", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "white", flex: 1 }}>
                💰 Overall
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                All games · After hole {lastCompleteHole || "—"}
              </div>
            </div>
            {overallNets.map(({ player, skins, betNet }, idx) => (
              <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: idx < overallNets.length - 1 ? "1px solid var(--gvg-gray-100)" : "none" }}>
                <div style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>
                  {idx === 0 ? "🏆" : idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--gvg-gray-800)" }}>{player.name}</div>
                  <div style={{ fontSize: 12, color: "var(--gvg-gray-500)", marginTop: 2 }}>
                    {skins} skin{skins !== 1 ? "s" : ""} · Bets {betNet >= 0 ? `+$${betNet.toFixed(2)}` : `-$${Math.abs(betNet).toFixed(2)}`}
                  </div>
                </div>
                <div style={{
                  fontFamily: "var(--gvg-font-display)",
                  fontSize: 22,
                  fontWeight: 700,
                  color: betNet > 0 ? "#16a34a" : betNet < 0 ? "var(--gvg-error)" : "var(--gvg-gray-400)",
                }}>
                  {betNet > 0 ? `+$${betNet.toFixed(2)}` : betNet < 0 ? `-$${Math.abs(betNet).toFixed(2)}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main game standings */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gvg-gray-500)", flex: 1 }}>
              Main Game
            </div>
            <div style={{ fontSize: 11, color: "var(--gvg-gray-400)", background: "var(--gvg-gray-200)", padding: "2px 8px", borderRadius: 999 }}>
              {lastCompleteHole > 0 ? `After hole ${lastCompleteHole}` : "No scores yet"}
            </div>
          </div>
          <div style={{ background: "var(--gvg-white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            <div style={{ padding: "12px 20px", background: "var(--gvg-gray-100)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700, color: "var(--gvg-gray-700)", fontSize: 14 }}>⛳ {gameDisplayName}</span>
              <span style={{ fontSize: 12, color: "var(--gvg-gray-500)" }}>Holes 1–18 · {lastCompleteHole} complete</span>
            </div>
            {matchResult && (
              <div style={{ padding: "10px 20px", background: "var(--gvg-gray-50)", borderBottom: "1px solid var(--gvg-gray-100)", fontSize: 14, color: "var(--gvg-grass)", fontWeight: 600 }}>
                {matchResult}
              </div>
            )}
            {entries.map((entry, idx) => {
              const skins = entry.skins ?? 0;
              const pts = entry.points ?? 0;
              const isTop = idx === 0;
              const displayVal = gameId === "stableford" ? `${pts} pts`
                : gameId === "matchplay" ? ((entry.matchScore ?? 0) > 0 ? `+${entry.matchScore}` : String(entry.matchScore ?? 0))
                : gameId === "nassau" ? `${skins}W`
                : `${skins}`;
              return (
                <div key={entry.playerId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid var(--gvg-gray-100)" }}>
                  <div style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>
                    {isTop && skins > 0 ? "🏆" : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: "var(--gvg-gray-800)" }}>{entry.name}</div>
                    {gameId === "nassau" && (
                      <div style={{ fontSize: 12, color: "var(--gvg-gray-500)", marginTop: 2 }}>
                        Front: {entry.front ?? "—"} · Back: {entry.back ?? "—"} · Total: {entry.total ?? "—"}
                      </div>
                    )}
                    {(gameId === "skins" || gameId === "wolf" || gameId === "chaosskins" || gameId === "custom") && (
                      <div style={{ fontSize: 12, color: "var(--gvg-gray-500)", marginTop: 2 }}>
                        {skins > 0 ? `${skins} hole${skins !== 1 ? "s" : ""} won` : "0 holes won"}
                        {(entry.ties ?? 0) > 0 ? ` · ${entry.ties} tie${(entry.ties ?? 0) !== 1 ? "s" : ""}` : ""}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "var(--gvg-font-display)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: skins > 0 || pts > 0 ? "var(--gvg-accent)" : "var(--gvg-gray-300)",
                  }}>
                    {displayVal}
                  </div>
                </div>
              );
            })}
            {carryover != null && carryover > 0 && (
              <div style={{ textAlign: "center", padding: 12, fontSize: 14, color: "var(--gvg-gray-500)" }}>
                🎯 <span style={{ color: "var(--gvg-accent)", fontWeight: 700 }}>{carryover}</span> skin{carryover !== 1 ? "s" : ""} carrying over
              </div>
            )}
          </div>
        </div>

        {/* Side Bets section */}
        {hasSideBets && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gvg-gray-500)", flex: 1 }}>
                Side Bets
              </div>
              <div style={{ fontSize: 11, color: "#c2410c", background: "#fff7ed", padding: "2px 8px", borderRadius: 999 }}>
                {sideBets.length} active
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sideBets.map((bet) => {
                const betPlayers = players.filter((p) => bet.player_ids.includes(p.id));
                const finalResults = (bet.results ?? []).filter((r) => r.is_final);
                const status = getBetStatus(bet);
                const holeRange = bet.hole_from === bet.hole_to
                  ? `Hole ${bet.hole_from}`
                  : `Holes ${bet.hole_from}–${bet.hole_to}`;

                // Per-player results for this bet
                const playerResults = betPlayers.map((p) => {
                  const wins = finalResults.filter((r) => r.winner_ids?.includes(p.id));
                  const totalWon = wins.reduce((sum, r) => sum + (r.amount_won ?? 0), 0);
                  const isWinner = wins.length > 0;
                  // Losses = all final results where player is NOT winner
                  const losses = finalResults.filter((r) => r.winner_ids && !r.winner_ids.includes(p.id));
                  const totalLost = losses.reduce((sum, r) => {
                    const loserCount = bet.player_ids.length - (r.winner_ids?.length ?? 0);
                    return sum + (r.amount_won ?? 0) / (loserCount || 1);
                  }, 0);
                  const net = totalWon - totalLost;
                  return { player: p, net, isWinner, wins: wins.length };
                });
                playerResults.sort((a, b) => b.net - a.net);

                return (
                  <div key={bet.id} style={{ background: "var(--gvg-white)", borderRadius: 16, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderLeft: "3px solid #f97316" }}>
                    <div style={{ padding: "12px 20px", background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, color: "#c2410c", fontSize: 14 }}>
                        {getBetIcon(bet.bet_type)} {getBetName(bet)}
                      </div>
                      <div style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: "var(--gvg-accent)", color: "white" }}>
                        {status}
                      </div>
                    </div>
                    <div style={{ padding: "8px 20px", borderBottom: "1px solid var(--gvg-gray-100)", fontSize: 12, color: "var(--gvg-gray-500)" }}>
                      {holeRange} · ${bet.amount.toFixed(2)}/hole
                    </div>
                    {playerResults.map(({ player, net, wins }, i) => (
                      <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: i < playerResults.length - 1 ? "1px solid var(--gvg-gray-100)" : "none" }}>
                        <div style={{ fontSize: 18, width: 28, textAlign: "center", flexShrink: 0 }}>
                          {i === 0 && net > 0 ? "🏆" : i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: "var(--gvg-gray-800)" }}>{player.name}</div>
                          <div style={{ fontSize: 12, color: "var(--gvg-gray-500)", marginTop: 2 }}>
                            {wins > 0 ? `${wins} hole${wins !== 1 ? "s" : ""} won` : "0 holes won"}
                          </div>
                        </div>
                        <div style={{
                          fontFamily: "var(--gvg-font-display)",
                          fontSize: 18,
                          fontWeight: 700,
                          color: net > 0 ? "#16a34a" : net < 0 ? "var(--gvg-error)" : "var(--gvg-gray-400)",
                          minWidth: 50,
                          textAlign: "right",
                        }}>
                          {net === 0 ? "Pending" : net > 0 ? `+$${net.toFixed(2)}` : `-$${Math.abs(net).toFixed(2)}`}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--gvg-gray-500)", fontStyle: "italic", paddingBottom: 24 }}>
          Good vibes only. 🤙
        </p>
      </main>
    </div>
  );
}
