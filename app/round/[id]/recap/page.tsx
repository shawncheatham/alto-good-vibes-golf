"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { calculateStandings } from "@/lib/scoring";
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

export default function RecapPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [round, setRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);

  // suppress unused var warning
  void router;

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
      setLoading(false);
    };
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--gvg-gray-500)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
          <p>Loading recap...</p>
        </div>
      </div>
    );
  }

  if (!round) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", padding: 32 }}>
        <p>Round not found.</p>
        <Link href="/round-history">Back to history</Link>
      </div>
    );
  }

  const gameId = round.game_id || round.game || "skins";
  const gameDisplayName = round.game_label || (GAMES[gameId as GameId]?.name ?? "Skins");

  const ledgerState = calculateStandings(gameId, scores, players, {
    customRules: round.custom_rules ?? undefined,
    multipliers: round.metadata?.chaosMultipliers,
  });
  const { entries, carryover, holeWinners, matchResult } = ledgerState;

  // Build winner line based on game type
  const buildWinnerLine = (): { headline: string; sub: string } => {
    if (gameId === "matchplay") {
      if (matchResult && matchResult !== "All Square") {
        return { headline: matchResult, sub: "Match Play · Final" };
      }
      return { headline: "All Square", sub: "Match Play · Final" };
    }

    if (gameId === "stableford") {
      const top = entries[0];
      if (top && (top.points ?? 0) > 0) {
        return { headline: top.name, sub: `${top.points} pts · Stableford` };
      }
      return { headline: "Tie Game", sub: "Stableford · No winner" };
    }

    if (gameId === "nassau") {
      const winners = entries.filter(e => (e.skins ?? 0) > 0);
      if (winners.length === 1) {
        return { headline: winners[0].name, sub: `Nassau · ${winners[0].skins} segment${(winners[0].skins ?? 0) !== 1 ? "s" : ""} won` };
      }
      if (winners.length > 1) {
        return { headline: winners.map(w => w.name).join(" & "), sub: "Nassau · Split" };
      }
      return { headline: "All Tied", sub: "Nassau · No clear winner" };
    }

    // Skins-based (skins, wolf, chaosskins, custom)
    const top = entries[0];
    const topSkins = top?.skins ?? 0;
    const skinsLabel = gameId === "chaosskins" ? "weighted skins" : "skins";
    if (topSkins > 0) {
      return { headline: top.name, sub: `${topSkins} ${skinsLabel} won` };
    }
    return { headline: "Tie Game", sub: `No ${skinsLabel} — all holes tied` };
  };

  const { headline, sub } = buildWinnerLine();

  // Build recap text for sharing
  const buildRecapText = (): string => {
    const lines: string[] = [
      `⛳ Round at ${round.course_name}`,
      `${gameDisplayName} · ${players.map(p => p.name).join(", ")}`,
      "",
    ];

    if (gameId === "matchplay") {
      lines.push(`🏆 ${headline}`);
    } else if (gameId === "stableford") {
      lines.push(`🏆 ${headline}`);
      entries.slice(0, 3).forEach((e, i) => {
        lines.push(`${i + 1}. ${e.name} — ${e.points} pts`);
      });
    } else if (gameId === "nassau") {
      lines.push(`🏆 ${headline}`);
      entries.slice(0, 3).forEach((e, i) => {
        lines.push(`${i + 1}. ${e.name} — F:${e.front ?? "—"} B:${e.back ?? "—"} T:${e.total ?? "—"}`);
      });
    } else {
      const top = entries[0];
      const topSkins = top?.skins ?? 0;
      lines.push(topSkins > 0
        ? `🏆 ${top.name} wins with ${topSkins} skin${topSkins !== 1 ? "s" : ""}`
        : "🏆 No skins won — all holes tied!");
      if (carryover != null && carryover > 0) {
        lines.push(`${carryover} skin${carryover !== 1 ? "s" : ""} left on the table`);
      }
    }

    if (holeWinners && holeWinners.length > 0) {
      lines.push("", "Top holes:");
      holeWinners.slice(0, 5).forEach(hw => {
        const p = players.find(p => p.id === hw.player_id);
        const multStr = hw.multiplier && hw.multiplier > 1 ? ` (${hw.multiplier}×)` : "";
        lines.push(`Hole ${hw.hole}${multStr}: ${p?.name ?? "?"} — ${hw.strokes}`);
      });
    }

    lines.push("", "Good vibes only. 🤙");
    return lines.join("\n");
  };

  const handleShare = async () => {
    const text = buildRecapText();
    if (navigator.share) {
      try {
        await navigator.share({ text });
        setShared(true);
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(text).then(() => setShared(true));
    }
  };

  const renderStandings = () => {
    if (gameId === "matchplay") {
      return entries.map((entry, idx) => (
        <div key={entry.playerId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "white", border: `2px solid ${idx === 0 && (entry.matchScore ?? 0) > 0 ? "var(--gvg-grass-light)" : "var(--gvg-gray-200)"}`, borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: idx === 0 && (entry.matchScore ?? 0) > 0 ? "var(--gvg-grass-dark)" : "var(--gvg-gray-200)", color: idx === 0 && (entry.matchScore ?? 0) > 0 ? "white" : "var(--gvg-gray-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{entry.name}</div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: (entry.matchScore ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-400)" }}>
            {(entry.matchScore ?? 0) > 0 ? `+${entry.matchScore}` : entry.matchScore ?? 0}
          </span>
        </div>
      ));
    }

    if (gameId === "stableford") {
      return entries.map((entry, idx) => (
        <div key={entry.playerId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: idx === 0 && (entry.points ?? 0) > 0 ? "var(--gvg-gray-50)" : "white", border: `2px solid ${idx === 0 && (entry.points ?? 0) > 0 ? "var(--gvg-grass-light)" : "var(--gvg-gray-200)"}`, borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: idx === 0 ? "var(--gvg-grass-dark)" : "var(--gvg-gray-200)", color: idx === 0 ? "white" : "var(--gvg-gray-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{entry.name}</div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: (entry.points ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-400)" }}>
            {entry.points ?? 0} pts
          </span>
        </div>
      ));
    }

    if (gameId === "nassau") {
      return entries.map((entry, idx) => (
        <div key={entry.playerId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: "white", border: "2px solid var(--gvg-gray-200)", borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gvg-gray-200)", color: "var(--gvg-gray-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{entry.name}</div>
            <div style={{ fontSize: 13, color: "var(--gvg-gray-500)", marginTop: 2 }}>
              Front: {entry.front ?? "—"} · Back: {entry.back ?? "—"} · Total: {entry.total ?? "—"}
            </div>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: (entry.skins ?? 0) > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-400)" }}>
            {entry.skins ?? 0}W
          </span>
        </div>
      ));
    }

    // Skins-based
    return entries.map((entry, idx) => {
      const skins = entry.skins ?? 0;
      const ties = entry.ties ?? 0;
      return (
        <div key={entry.playerId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: idx === 0 && skins > 0 ? "var(--gvg-gray-50)" : "white", border: `2px solid ${idx === 0 && skins > 0 ? "var(--gvg-grass-light)" : "var(--gvg-gray-200)"}`, borderRadius: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: idx === 0 && skins > 0 ? "var(--gvg-grass-dark)" : "var(--gvg-gray-200)", color: idx === 0 && skins > 0 ? "white" : "var(--gvg-gray-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
            {idx + 1}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{entry.name}</div>
            <div style={{ fontSize: 13, color: "var(--gvg-gray-500)", marginTop: 2 }}>
              {skins > 0 ? `${skins} hole${skins !== 1 ? "s" : ""} won` : "0 holes won"}
              {ties > 0 ? ` · ${ties} tie${ties !== 1 ? "s" : ""}` : ""}
            </div>
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "var(--gvg-font-mono)", color: skins > 0 ? "var(--gvg-positive)" : "var(--gvg-gray-400)" }}>
            {skins} skin{skins !== 1 ? "s" : ""}
          </span>
        </div>
      );
    });
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--gvg-white)", minHeight: "100vh", boxShadow: "var(--gvg-shadow-lg)" }}>
      {/* Header */}
      <header style={{ background: "var(--gvg-grass-dark)", color: "white", padding: "16px", boxShadow: "var(--gvg-shadow-md)" }}>
        <h1 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Good Vibes Golf</h1>
        <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>Round Recap</p>
      </header>

      <main style={{ padding: 16 }}>
        {/* Course + Winner Hero */}
        <div style={{ background: "linear-gradient(135deg, var(--gvg-grass-dark) 0%, var(--gvg-grass) 100%)", borderRadius: 16, padding: 24, color: "white", marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏆</div>
          <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 28, fontWeight: 700, margin: 0 }}>
            {headline}
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>{sub}</p>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: 8 }}>⛳ {round.course_name}</p>
          {matchResult && gameId === "matchplay" && (
            <p style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>{matchResult}</p>
          )}
        </div>

        {/* Final Standings */}
        <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 12 }}>Final Standings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {renderStandings()}

          {carryover != null && carryover > 0 && (gameId === "skins" || gameId === "chaosskins" || gameId === "wolf" || gameId === "custom") && (
            <div style={{ padding: "12px 16px", background: "var(--gvg-sand-light)", border: "2px solid var(--gvg-sand)", borderRadius: 12, fontSize: 14, color: "var(--gvg-gray-700)" }}>
              🏌️ {carryover} skin{carryover !== 1 ? "s" : ""} left on the table
            </div>
          )}
        </div>

        {/* Hole Highlights */}
        {holeWinners && holeWinners.length > 0 && (
          <>
            <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 12 }}>Hole Highlights</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {holeWinners.map(hw => {
                const p = players.find(p => p.id === hw.player_id);
                return (
                  <div key={hw.hole} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "white", border: "1px solid var(--gvg-gray-200)", borderRadius: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--gvg-accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                      {hw.hole}
                    </div>
                    <div style={{ flex: 1, fontSize: 15, color: "var(--gvg-gray-700)" }}>
                      <span style={{ fontWeight: 700, color: "var(--gvg-gray-900)" }}>{p?.name}</span> took it with a <span style={{ fontWeight: 700 }}>{hw.strokes}</span>
                      {hw.multiplier && hw.multiplier > 1 && (
                        <span style={{ fontSize: 12, color: "var(--gvg-accent)", fontWeight: 700, marginLeft: 6 }}>{hw.multiplier}×</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Share */}
        <button
          onClick={handleShare}
          style={{ width: "100%", padding: "16px", background: shared ? "var(--gvg-success)" : "var(--gvg-accent)", color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 12, cursor: "pointer", marginBottom: 12, minHeight: 56 }}
        >
          {shared ? "✓ Recap Copied!" : "📤 Share Recap"}
        </button>

        <Link
          href="/"
          style={{ display: "block", width: "100%", padding: "14px", textAlign: "center", background: "white", color: "var(--gvg-grass-dark)", fontSize: 15, fontWeight: 600, border: "2px solid var(--gvg-grass-light)", borderRadius: 12, textDecoration: "none" }}
        >
          Back to Home
        </Link>

        <p style={{ textAlign: "center", fontSize: 14, color: "var(--gvg-gray-500)", marginTop: 16, fontStyle: "italic" }}>Good vibes only. 🤙</p>
      </main>
    </div>
  );
}
