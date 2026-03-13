"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { calculateStandings, LedgerEntry } from "@/lib/scoring";
import { GAMES, GameId } from "@/lib/games";

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
  created_at: string;
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

export default function ScorecardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [currentHole, setCurrentHole] = useState(1);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [view, setView] = useState<"scorecard" | "ledger">("scorecard");
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const lastEntryRef = useRef<{ player_id: string; hole: number; strokes: number } | null>(null);
  const holeStripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: r }, { data: p }, { data: s }] = await Promise.all([
        supabase.from("rounds").select("*").eq("id", id).single(),
        supabase.from("round_players").select("*").eq("round_id", id).order("position"),
        supabase.from("score_entries").select("*").eq("round_id", id),
      ]);
      if (r) setRound(r);
      if (p) {
        setPlayers(p);
        setActivePlayerId(p[0]?.id ?? null);
      }
      if (s) setScores(s);

      if (p && s) {
        for (let h = 1; h <= 18; h++) {
          const holeEntries = s.filter((e: ScoreEntry) => e.hole === h);
          if (holeEntries.length < p.length) {
            setCurrentHole(h);
            break;
          }
        }
      }
      setLoading(false);
    };
    load();
  }, [id, supabase]);

  useEffect(() => {
    if (holeStripRef.current) {
      const activeEl = holeStripRef.current.querySelector(`[data-hole="${currentHole}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentHole]);

  const getScore = (playerId: string, hole: number) => {
    return scores.find(s => s.player_id === playerId && s.hole === hole) ?? null;
  };

  const upsertScore = useCallback(async (playerId: string, hole: number, strokes: number) => {
    const existing = getScore(playerId, hole);
    if (existing) {
      lastEntryRef.current = { player_id: playerId, hole, strokes: existing.strokes ?? strokes };
    }

    const { data, error } = await supabase
      .from("score_entries")
      .upsert({ round_id: id, player_id: playerId, hole, strokes, updated_at: new Date().toISOString() }, { onConflict: "round_id,player_id,hole" })
      .select()
      .single();

    if (!error && data) {
      setScores(prev => {
        const filtered = prev.filter(s => !(s.player_id === playerId && s.hole === hole));
        return [...filtered, data];
      });
    }
  }, [id, supabase, scores]);

  const undoLastEntry = useCallback(async () => {
    if (!lastEntryRef.current) return;
    const { player_id, hole, strokes } = lastEntryRef.current;
    await upsertScore(player_id, hole, strokes);
    lastEntryRef.current = null;
  }, [upsertScore]);

  const adjustScore = (playerId: string, hole: number, delta: number) => {
    const current = getScore(playerId, hole)?.strokes ?? 1;
    const newVal = Math.max(1, Math.min(15, current + delta));
    upsertScore(playerId, hole, newVal);
  };

  const isHoleComplete = (hole: number) => {
    return players.every(p => {
      const s = getScore(p.id, hole);
      return s && s.strokes != null;
    });
  };

  const isAllComplete = () => {
    for (let h = 1; h <= 18; h++) {
      if (!isHoleComplete(h)) return false;
    }
    return true;
  };

  const getHoleState = (hole: number): "complete" | "active" | "pending" => {
    if (hole === currentHole) return "active";
    if (isHoleComplete(hole)) return "complete";
    return "pending";
  };

  const currentHoleScores = players.map(p => ({
    player: p,
    score: getScore(p.id, currentHole),
  }));

  const currentHoleComplete = isHoleComplete(currentHole);

  const abandonRound = async () => {
    await supabase.from("rounds").update({ status: "abandoned" }).eq("id", id);
    router.push("/round-history");
  };

  const deleteRound = async () => {
    await supabase.from("rounds").delete().eq("id", id);
    router.push("/round-history");
  };

  const finishRound = async () => {
    await supabase.from("rounds").update({ status: "complete", completed_at: new Date().toISOString() }).eq("id", id);
    router.push(`/round/${id}/recap`);
  };

  // Multi-game standings
  const gameId = round?.game_id || round?.game || "skins";
  const ledgerState = calculateStandings(gameId, scores, players, {
    customRules: round?.custom_rules ?? undefined,
    multipliers: round?.metadata?.chaosMultipliers,
  });
  const { entries, carryover, matchResult } = ledgerState;

  // Chaos multiplier for current hole
  const chaosMultiplier = gameId === "chaosskins"
    ? (round?.metadata?.chaosMultipliers?.[currentHole - 1] ?? 1)
    : null;

  // Game display name
  const gameDisplayName = round?.game_label || (GAMES[gameId as GameId]?.name ?? "Skins");

  const renderLedgerEntry = (entry: LedgerEntry, rank: number) => {
    // Determine display based on game type
    if (gameId === "nassau") {
      return (
        <div key={entry.playerId} style={{ background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-200)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>{entry.name}</h3>
            <span style={{ fontSize: 16, fontWeight: 700, color: (entry.skins ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-500)" }}>
              {entry.skins ?? 0} W
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--gvg-gray-600)" }}>
            <span>F: {entry.front ?? "—"}</span>
            <span>B: {entry.back ?? "—"}</span>
            <span>T: {entry.total ?? "—"}</span>
          </div>
        </div>
      );
    }

    if (gameId === "matchplay") {
      return (
        <div key={entry.playerId} style={{ background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-200)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>{entry.name}</h3>
            <span style={{ fontSize: 16, fontWeight: 700, color: (entry.matchScore ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-500)" }}>
              {(entry.matchScore ?? 0) > 0 ? `+${entry.matchScore}` : entry.matchScore ?? 0}
            </span>
          </div>
        </div>
      );
    }

    if (gameId === "stableford") {
      return (
        <div key={entry.playerId} style={{ background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-200)", borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>{entry.name}</h3>
            <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: (entry.points ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-500)" }}>
              {entry.points ?? 0} pts
            </span>
          </div>
          <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginTop: 8 }}>
            Rank #{rank + 1}
          </p>
        </div>
      );
    }

    // Default: skins-based (skins, wolf, chaosskins, custom)
    const skins = entry.skins ?? 0;
    const ties = entry.ties ?? 0;
    return (
      <div key={entry.playerId} style={{ background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-200)", borderRadius: 12, padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>{entry.name}</h3>
          <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: skins > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-500)" }}>
            {skins} skin{skins !== 1 ? "s" : ""}
          </span>
        </div>
        <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginTop: 8 }}>
          {skins > 0 ? `${skins} hole${skins !== 1 ? "s" : ""} won` : "0 holes won"}
          {ties > 0 ? ` · ${ties} tie${ties !== 1 ? "s" : ""}` : ""}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--gvg-gray-500)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
          <p>Loading round...</p>
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

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--gvg-white)", minHeight: "100vh", boxShadow: "var(--gvg-shadow-lg)" }}>
      {/* Header */}
      <header style={{ background: "var(--gvg-grass-dark)", color: "white", padding: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--gvg-shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Good Vibes Golf</h1>
            <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              {gameDisplayName} · Hole {currentHole} of {round.holes}
              {chaosMultiplier && chaosMultiplier > 1 ? ` · ${chaosMultiplier}× multiplier` : ""}
            </p>
          </div>
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 14px", borderRadius: 8, fontSize: 18, cursor: "pointer", minHeight: 48, lineHeight: 1 }}
              aria-label="Round menu"
            >
              ···
            </button>
            {showMenu && (
              <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", borderRadius: 12, boxShadow: "var(--gvg-shadow-lg)", border: "1px solid var(--gvg-gray-200)", minWidth: 180, zIndex: 200 }}>
                <button
                  onClick={() => { setShowMenu(false); abandonRound(); }}
                  style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "var(--gvg-gray-700)", borderBottom: "1px solid var(--gvg-gray-100)" }}
                >
                  Abandon Round
                </button>
                <button
                  onClick={() => { setShowMenu(false); setShowDeleteModal(true); }}
                  style={{ width: "100%", textAlign: "left", padding: "14px 16px", background: "none", border: "none", cursor: "pointer", fontSize: 15, color: "var(--gvg-error)" }}
                >
                  Delete Round
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hole Strip */}
      <div style={{ background: "var(--gvg-gray-100)", borderBottom: "2px solid var(--gvg-gray-200)", padding: "16px 8px", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <div ref={holeStripRef} style={{ display: "flex", gap: 8, minWidth: "min-content", padding: "0 8px" }}>
          {Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
            const state = getHoleState(hole);
            const mult = gameId === "chaosskins" ? (round?.metadata?.chaosMultipliers?.[hole - 1] ?? 1) : null;
            return (
              <div key={hole} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 44 }} data-hole={hole}>
                <button
                  onClick={() => setCurrentHole(hole)}
                  style={{
                    width: 40, height: 40,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer",
                    transition: "all 0.2s",
                    background: state === "active" ? "var(--gvg-accent)" : state === "complete" ? "var(--gvg-success)" : "var(--gvg-white)",
                    color: state === "pending" ? "var(--gvg-gray-400)" : "white",
                    border: `2px solid ${state === "active" ? "var(--gvg-accent)" : state === "complete" ? "var(--gvg-success)" : "var(--gvg-gray-300)"}`,
                    boxShadow: state === "active" ? "var(--gvg-shadow-md)" : "none",
                  }}
                  aria-label={`Hole ${hole}, ${state}`}
                >
                  {hole}
                </button>
                <span style={{ fontSize: 14, lineHeight: 1 }}>
                  {state === "complete" ? "✓" : state === "active" ? "◆" : mult && mult > 1 ? `${mult}×` : "○"}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12, fontSize: 12, color: "var(--gvg-gray-600)", flexWrap: "wrap" }}>
          <span>✓ = scores entered</span>
          <span>◆ = active hole</span>
          <span>○ = pending</span>
        </div>
      </div>

      {/* Scorecard View */}
      {view === "scorecard" && (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
          {currentHoleScores.map(({ player, score }) => {
            const isActive = player.id === activePlayerId;
            const hasScore = score && score.strokes != null;
            return (
              <div
                key={player.id}
                onClick={() => setActivePlayerId(player.id)}
                style={{
                  background: "var(--gvg-white)",
                  border: `2px solid ${isActive ? "var(--gvg-accent)" : "var(--gvg-gray-200)"}`,
                  borderRadius: 12, padding: 16, cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: isActive ? "0 0 0 3px rgba(255,107,53,0.1), var(--gvg-shadow-md)" : "none",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: isActive ? 8 : 0 }}>
                  <div>
                    <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 20, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>{player.name}</h2>
                    <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginTop: 4 }}>Hole {currentHole}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {hasScore ? (
                      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: "var(--gvg-gray-900)" }}>{score.strokes}</span>
                    ) : (
                      <span style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: "var(--gvg-gray-400)" }}>—</span>
                    )}
                    <span style={{
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.025em",
                      background: isActive ? "var(--gvg-accent)" : hasScore ? "var(--gvg-success)" : "var(--gvg-gray-200)",
                      color: isActive || hasScore ? "white" : "var(--gvg-gray-600)",
                    }}>
                      {isActive ? "Active" : hasScore ? "Entered ✓" : "Pending"}
                    </span>
                  </div>
                </div>

                {isActive && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: "2px solid var(--gvg-gray-100)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, margin: "16px 0" }}>
                      <button
                        onClick={e => { e.stopPropagation(); adjustScore(player.id, currentHole, -1); }}
                        style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gvg-accent)", color: "white", border: "none", fontSize: 30, fontWeight: 700, cursor: "pointer", boxShadow: "var(--gvg-shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none" }}
                        aria-label="Decrease score"
                      >−</button>
                      <span style={{ fontSize: 36, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: "var(--gvg-gray-900)", minWidth: 60, textAlign: "center" }}>
                        {score?.strokes ?? 1}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); adjustScore(player.id, currentHole, 1); }}
                        style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--gvg-accent)", color: "white", border: "none", fontSize: 30, fontWeight: 700, cursor: "pointer", boxShadow: "var(--gvg-shadow-md)", display: "flex", alignItems: "center", justifyContent: "center", userSelect: "none" }}
                        aria-label="Increase score"
                      >+</button>
                    </div>
                    <p style={{ textAlign: "center", fontSize: 14, color: "var(--gvg-gray-600)", marginTop: 8 }}>
                      Auto-saves ·{" "}
                      <button
                        onClick={e => { e.stopPropagation(); undoLastEntry(); }}
                        style={{ background: "none", border: "none", color: "var(--gvg-accent)", textDecoration: "underline", cursor: "pointer", fontSize: 14, fontWeight: 600, padding: 0 }}
                      >
                        Undo last entry
                      </button>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ledger View */}
      {view === "ledger" && (
        <div>
          {!currentHoleComplete && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "var(--gvg-warning)", color: "var(--gvg-gray-900)", padding: 16, borderRadius: 12, margin: 16, boxShadow: "var(--gvg-shadow)" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>⚠️</span>
              <div>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>Hole {currentHole} scores incomplete</h3>
                <p style={{ fontSize: 14, opacity: 0.9 }}>Ledger updates when all scores are entered. Switch to Scorecard to enter scores.</p>
              </div>
            </div>
          )}

          <div style={{ padding: "20px 16px 8px", background: "var(--gvg-gray-50)", borderBottom: "2px solid var(--gvg-gray-200)" }}>
            <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 20, fontWeight: 700, color: "var(--gvg-gray-900)", margin: 0 }}>
              Running Standings
            </h2>
            {matchResult && (
              <p style={{ fontSize: 14, color: "var(--gvg-grass)", fontWeight: 600, marginTop: 4 }}>{matchResult}</p>
            )}
          </div>

          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {entries.map((entry, rank) => renderLedgerEntry(entry, rank))}

            {carryover != null && carryover > 0 && (gameId === "skins" || gameId === "chaosskins" || gameId === "wolf" || gameId === "custom") && (
              <div style={{ padding: "12px 16px", background: "var(--gvg-sand-light)", border: "2px solid var(--gvg-sand)", borderRadius: 12, fontSize: 14, color: "var(--gvg-gray-700)" }}>
                🏌️ {carryover} skin{carryover !== 1 ? "s" : ""} carrying over
              </div>
            )}
          </div>
          <p style={{ textAlign: "center", padding: 16, fontSize: 14, color: "var(--gvg-gray-500)", fontStyle: "italic" }}>Tap any hole to jump to it</p>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ padding: 16, borderTop: "2px solid var(--gvg-gray-200)", background: "var(--gvg-gray-50)", position: "sticky", bottom: 0 }}>
        {isAllComplete() && (
          <button
            onClick={finishRound}
            style={{ width: "100%", padding: "14px", background: "var(--gvg-grass-dark)", color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 12, minHeight: 52 }}
          >
            🏆 Finish Round
          </button>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 12 }}>
          <button
            onClick={() => setCurrentHole(h => Math.max(1, h - 1))}
            disabled={currentHole === 1}
            style={{ flex: 1, maxWidth: 160, padding: "12px 20px", background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-300)", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "var(--gvg-gray-700)", cursor: currentHole === 1 ? "not-allowed" : "pointer", opacity: currentHole === 1 ? 0.4 : 1, minHeight: 48 }}
          >
            ◀ Hole {currentHole - 1}
          </button>
          <button
            onClick={() => setCurrentHole(h => Math.min(18, h + 1))}
            disabled={currentHole === 18}
            style={{ flex: 1, maxWidth: 160, padding: "12px 20px", background: "var(--gvg-white)", border: "2px solid var(--gvg-gray-300)", borderRadius: 12, fontSize: 15, fontWeight: 600, color: "var(--gvg-gray-700)", cursor: currentHole === 18 ? "not-allowed" : "pointer", opacity: currentHole === 18 ? 0.4 : 1, minHeight: 48 }}
          >
            Hole {currentHole + 1} ▶
          </button>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
          <button
            onClick={() => setView("scorecard")}
            style={{ flex: 1, maxWidth: 160, padding: "12px 20px", background: view === "scorecard" ? "var(--gvg-grass-dark)" : "var(--gvg-white)", color: view === "scorecard" ? "white" : "var(--gvg-gray-600)", border: "2px solid var(--gvg-gray-300)", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 48, borderColor: view === "scorecard" ? "var(--gvg-grass-dark)" : "var(--gvg-gray-300)" }}
          >
            Scorecard
          </button>
          <button
            onClick={() => setView("ledger")}
            style={{ flex: 1, maxWidth: 160, padding: "12px 20px", background: view === "ledger" ? "var(--gvg-grass-dark)" : "var(--gvg-white)", color: view === "ledger" ? "white" : "var(--gvg-gray-600)", border: "2px solid var(--gvg-gray-300)", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer", minHeight: 48, borderColor: view === "ledger" ? "var(--gvg-grass-dark)" : "var(--gvg-gray-300)" }}
          >
            Ledger
          </button>
        </div>
      </nav>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "white", borderRadius: 16, padding: 24, maxWidth: 360, width: "100%", boxShadow: "var(--gvg-shadow-lg)" }}>
            <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 20, fontWeight: 700, marginBottom: 12, color: "var(--gvg-gray-900)" }}>Delete Round?</h3>
            <p style={{ fontSize: 15, color: "var(--gvg-gray-600)", marginBottom: 24 }}>This will permanently delete the round and all scores. This cannot be undone.</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: "12px", background: "white", border: "2px solid var(--gvg-gray-300)", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={deleteRound}
                style={{ flex: 1, padding: "12px", background: "var(--gvg-error)", color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showMenu && (
        <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setShowMenu(false)} />
      )}
    </div>
  );
}
