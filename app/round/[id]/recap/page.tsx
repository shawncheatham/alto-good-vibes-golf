"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Round {
  id: string;
  course_name: string;
  game: string;
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

function calculateSkins(scores: ScoreEntry[], players: Player[]) {
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
      const skins = 1 + carryover;
      skinsByPlayer[winners[0].player_id] = (skinsByPlayer[winners[0].player_id] || 0) + skins;
      holeWinners.push({ hole, player_id: winners[0].player_id, strokes: winners[0].strokes as number });
      carryover = 0;
    } else {
      winners.forEach(w => { tiesByPlayer[w.player_id] = (tiesByPlayer[w.player_id] || 0) + 1; });
      carryover++;
    }
  }
  return { skinsByPlayer, tiesByPlayer, carryover, holeWinners };
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

  const { skinsByPlayer, tiesByPlayer, carryover, holeWinners } = calculateSkins(scores, players);

  const sortedPlayers = [...players].sort((a, b) => (skinsByPlayer[b.id] || 0) - (skinsByPlayer[a.id] || 0));
  const winner = sortedPlayers[0];
  const winnerSkins = skinsByPlayer[winner?.id] || 0;

  const recapText = [
    `⛳ Round at ${round.course_name}`,
    players.map(p => p.name).join(", "),
    "",
    winnerSkins > 0
      ? `🏆 ${winner.name} wins with ${winnerSkins} skin${winnerSkins !== 1 ? "s" : ""}`
      : "🏆 No skins won — all holes tied!",
    carryover > 0 ? `${carryover} skin${carryover !== 1 ? "s" : ""} left on the table` : "",
    "",
    ...holeWinners.slice(0, 5).map(hw => {
      const p = players.find(p => p.id === hw.player_id);
      return `Hole ${hw.hole}: ${p?.name ?? "?"} took it with a ${hw.strokes}`;
    }),
    "",
    "Good vibes only. 🤙",
  ].filter(line => line !== undefined).join("\n");

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: recapText });
        setShared(true);
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(recapText).then(() => setShared(true));
    }
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
            {winnerSkins > 0 ? winner?.name : "Tie Game"}
          </h2>
          <p style={{ fontSize: 16, opacity: 0.9, marginTop: 4 }}>
            {winnerSkins > 0 ? `${winnerSkins} skin${winnerSkins !== 1 ? "s" : ""} won` : "No skins — all tied up"}
          </p>
          <p style={{ fontSize: 14, opacity: 0.75, marginTop: 8 }}>⛳ {round.course_name}</p>
        </div>

        {/* Final Standings */}
        <h3 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 12 }}>Final Standings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {sortedPlayers.map((player, idx) => {
            const skins = skinsByPlayer[player.id] || 0;
            const ties = tiesByPlayer[player.id] || 0;
            return (
              <div key={player.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: idx === 0 && skins > 0 ? "var(--gvg-gray-50)" : "white", border: `2px solid ${idx === 0 && skins > 0 ? "var(--gvg-grass-light)" : "var(--gvg-gray-200)"}`, borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: idx === 0 && skins > 0 ? "var(--gvg-grass-dark)" : "var(--gvg-gray-200)", color: idx === 0 && skins > 0 ? "white" : "var(--gvg-gray-600)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "var(--gvg-gray-900)" }}>{player.name}</div>
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
          })}
          {carryover > 0 && (
            <div style={{ padding: "12px 16px", background: "var(--gvg-sand-light)", border: "2px solid var(--gvg-sand)", borderRadius: 12, fontSize: 14, color: "var(--gvg-gray-700)" }}>
              🏌️ {carryover} skin{carryover !== 1 ? "s" : ""} left on the table
            </div>
          )}
        </div>

        {/* Hole Highlights */}
        {holeWinners.length > 0 && (
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
