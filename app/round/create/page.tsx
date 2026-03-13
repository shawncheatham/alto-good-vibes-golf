"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import GameCatalog, { CustomRules } from "@/components/GameCatalog";
import { Tier } from "@/lib/games";

interface Course {
  id?: string | number;
  club_name?: string;
  course_name?: string;
  location?: { city?: string; state?: string; country?: string };
  city?: string;
  state?: string;
}

type Step = "course" | "players" | "confirm";

function generateMultipliers(seed: string): number[] {
  const base = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 3];
  // Simple deterministic shuffle using seed characters
  const arr = [...base];
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    h = (Math.imul(1664525, h) + 1013904223) | 0;
    const j = Math.abs(h) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function CreateRoundPage() {
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState<Step>("course");

  // Course search state
  const [courseQuery, setCourseQuery] = useState("");
  const [courseResults, setCourseResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Player state
  const [players, setPlayers] = useState<string[]>(["", "", "", ""]);
  const [visiblePlayers, setVisiblePlayers] = useState(1);

  // Game state
  const [selectedGame, setSelectedGame] = useState("skins");
  const [gameLabel, setGameLabel] = useState("Skins");
  const [customRules, setCustomRules] = useState<CustomRules | null>(null);

  // User tier
  const [userTier, setUserTier] = useState<Tier>("free");

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load user tier
  useEffect(() => {
    const loadTier = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("tier").eq("id", user.id).single();
      if (data?.tier) setUserTier(data.tier as Tier);
    };
    loadTier();
  }, [supabase]);

  const handleCourseInput = useCallback((q: string) => {
    setCourseQuery(q);
    setSelectedCourse(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.trim().length < 2) {
      setCourseResults([]);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/courses/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setCourseResults(data.courses || []);
      } catch {
        setCourseResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, []);

  const selectCourse = (course: Course) => {
    setSelectedCourse(course);
    const name = course.club_name || course.course_name || "";
    setCourseQuery(name);
    setCourseResults([]);
  };

  const updatePlayer = (i: number, val: string) => {
    const next = [...players];
    next[i] = val;
    setPlayers(next);
  };

  const addPlayer = () => {
    if (visiblePlayers < 4) setVisiblePlayers(v => v + 1);
  };

  const moveUp = (i: number) => {
    if (i === 0) return;
    const next = [...players];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setPlayers(next);
  };

  const moveDown = (i: number) => {
    if (i >= visiblePlayers - 1) return;
    const next = [...players];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setPlayers(next);
  };

  const activePlayers = players.slice(0, visiblePlayers).filter(n => n.trim());

  // Wolf requires exactly 4 players
  const wolfPlayerError = selectedGame === "wolf" && activePlayers.length !== 4
    ? `Wolf requires exactly 4 players (you have ${activePlayers.length})`
    : null;

  const createRound = async () => {
    if (wolfPlayerError) {
      setError(wolfPlayerError);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const courseName = selectedCourse
        ? (selectedCourse.club_name || selectedCourse.course_name || courseQuery)
        : courseQuery;
      const courseId = selectedCourse
        ? String(selectedCourse.id ?? "")
        : undefined;

      // Build metadata for chaos skins
      let metadata: Record<string, unknown> | null = null;
      if (selectedGame === "chaosskins") {
        // We'll use round id as seed after insert, so generate with timestamp for now
        // Will be updated once we have the round id
        metadata = { chaosMultipliers: generateMultipliers(Date.now().toString()) };
      }

      const { data: round, error: roundErr } = await supabase
        .from("rounds")
        .insert({
          course_name: courseName,
          course_id: courseId,
          game: selectedGame,
          game_id: selectedGame,
          game_label: gameLabel,
          custom_rules: customRules ?? null,
          metadata,
          created_by: user.id,
        })
        .select()
        .single();

      if (roundErr || !round) throw roundErr || new Error("Failed to create round");

      // Update chaos skins multipliers with round id as seed
      if (selectedGame === "chaosskins") {
        const deterministicMultipliers = generateMultipliers(round.id);
        await supabase.from("rounds").update({ metadata: { chaosMultipliers: deterministicMultipliers } }).eq("id", round.id);
      }

      if (activePlayers.length === 0) throw new Error("Add at least one player");

      const { error: playersErr } = await supabase
        .from("round_players")
        .insert(activePlayers.map((name, i) => ({ round_id: round.id, name: name.trim(), position: i + 1 })));

      if (playersErr) throw playersErr;

      router.push(`/round/${round.id}/scorecard`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const courseDisplayName = (c: Course) => {
    const name = c.club_name || c.course_name || "Unknown Course";
    const loc = c.location
      ? [c.location.city, c.location.state].filter(Boolean).join(", ")
      : [c.city, c.state].filter(Boolean).join(", ");
    return { name, loc };
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--gvg-white)", minHeight: "100vh", boxShadow: "var(--gvg-shadow-lg)" }}>
      {/* Header */}
      <header style={{ background: "var(--gvg-grass-dark)", color: "white", padding: "16px", position: "sticky", top: 0, zIndex: 100, boxShadow: "var(--gvg-shadow-md)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 18, fontWeight: 700, margin: 0 }}>Good Vibes Golf</h1>
            <p style={{ fontSize: 14, opacity: 0.9, marginTop: 4 }}>
              {step === "course" ? "Step 1: Choose Course" : step === "players" ? "Step 2: Add Players" : "Step 3: Confirm & Start"}
            </p>
          </div>
          <button
            onClick={() => router.back()}
            style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 16px", borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", minHeight: 48 }}
          >
            Cancel
          </button>
        </div>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          {(["course", "players", "confirm"] as Step[]).map((s, i) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step === s ? "var(--gvg-accent)" : (["course", "players", "confirm"].indexOf(step) > i ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.2)") }} />
          ))}
        </div>
      </header>

      <main style={{ padding: 16 }}>
        {/* Step 1: Course */}
        {step === "course" && (
          <div>
            <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 24, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 8 }}>Where are you playing?</h2>
            <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginBottom: 24 }}>Search for your course or enter the name manually.</p>

            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search for a course..."
                value={courseQuery}
                onChange={e => handleCourseInput(e.target.value)}
                style={{ width: "100%", padding: "14px 16px", fontSize: 16, border: "2px solid var(--gvg-gray-300)", borderRadius: 12, outline: "none", boxSizing: "border-box" }}
                onFocus={e => (e.target.style.borderColor = "var(--gvg-grass)")}
                onBlur={e => (e.target.style.borderColor = selectedCourse ? "var(--gvg-grass)" : "var(--gvg-gray-300)")}
              />
              {searching && (
                <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "var(--gvg-gray-500)" }}>Searching...</div>
              )}
              {courseResults.length > 0 && !selectedCourse && (
                <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "white", border: "2px solid var(--gvg-gray-200)", borderRadius: 12, boxShadow: "var(--gvg-shadow-lg)", zIndex: 50, maxHeight: 280, overflowY: "auto" }}>
                  {courseResults.slice(0, 8).map((c, i) => {
                    const { name, loc } = courseDisplayName(c);
                    return (
                      <button
                        key={i}
                        role="option"
                        data-testid="course-result"
                        onClick={() => selectCourse(c)}
                        style={{ width: "100%", textAlign: "left", padding: "12px 16px", background: "none", border: "none", borderBottom: i < courseResults.slice(0, 8).length - 1 ? "1px solid var(--gvg-gray-100)" : "none", cursor: "pointer", display: "block" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "var(--gvg-gray-50)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}
                      >
                        <div style={{ fontWeight: 600, color: "var(--gvg-gray-900)", fontSize: 15 }}>{name}</div>
                        {loc && <div style={{ fontSize: 13, color: "var(--gvg-gray-500)", marginTop: 2 }}>{loc}</div>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {selectedCourse && (
              <div style={{ marginTop: 12, padding: "12px 16px", background: "var(--gvg-gray-50)", border: "2px solid var(--gvg-grass)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--gvg-gray-900)" }}>{courseDisplayName(selectedCourse).name}</div>
                  {courseDisplayName(selectedCourse).loc && <div style={{ fontSize: 13, color: "var(--gvg-gray-500)" }}>{courseDisplayName(selectedCourse).loc}</div>}
                </div>
                <span style={{ color: "var(--gvg-success)", fontSize: 20 }}>✓</span>
              </div>
            )}

            {courseQuery.trim().length >= 2 && !selectedCourse && !searching && courseResults.length === 0 && (
              <p style={{ marginTop: 12, fontSize: 13, color: "var(--gvg-gray-500)" }}>No results found — we&apos;ll use &ldquo;{courseQuery}&rdquo; as the course name.</p>
            )}

            <button
              onClick={() => {
                if (!courseQuery.trim()) return;
                setStep("players");
              }}
              disabled={!courseQuery.trim()}
              style={{ marginTop: 32, width: "100%", padding: "16px", background: courseQuery.trim() ? "var(--gvg-grass-dark)" : "var(--gvg-gray-300)", color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 12, cursor: courseQuery.trim() ? "pointer" : "not-allowed", minHeight: 56 }}
            >
              Next: Add Players →
            </button>
          </div>
        )}

        {/* Step 2: Players */}
        {step === "players" && (
          <div>
            <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 24, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 8 }}>Who&apos;s playing?</h2>
            <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginBottom: 24 }}>Add 1–4 players. Player 1 is required.</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {Array.from({ length: visiblePlayers }).map((_, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button
                      onClick={() => moveUp(i)}
                      disabled={i === 0}
                      style={{ width: 32, height: 28, background: "var(--gvg-gray-100)", border: "1px solid var(--gvg-gray-300)", borderRadius: 4, cursor: i === 0 ? "not-allowed" : "pointer", fontSize: 12, opacity: i === 0 ? 0.3 : 1 }}
                      aria-label={`Move player ${i + 1} up`}
                    >▲</button>
                    <button
                      onClick={() => moveDown(i)}
                      disabled={i >= visiblePlayers - 1}
                      style={{ width: 32, height: 28, background: "var(--gvg-gray-100)", border: "1px solid var(--gvg-gray-300)", borderRadius: 4, cursor: i >= visiblePlayers - 1 ? "not-allowed" : "pointer", fontSize: 12, opacity: i >= visiblePlayers - 1 ? 0.3 : 1 }}
                      aria-label={`Move player ${i + 1} down`}
                    >▼</button>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: "var(--gvg-gray-600)", display: "block", marginBottom: 4 }}>Player {i + 1}{i === 0 ? " *" : ""}</label>
                    <input
                      type="text"
                      placeholder={`Player ${i + 1} name`}
                      value={players[i] || ""}
                      onChange={e => updatePlayer(i, e.target.value)}
                      style={{ width: "100%", padding: "12px 14px", fontSize: 16, border: "2px solid var(--gvg-gray-300)", borderRadius: 10, outline: "none", boxSizing: "border-box" }}
                      onFocus={e => (e.target.style.borderColor = "var(--gvg-grass)")}
                      onBlur={e => (e.target.style.borderColor = "var(--gvg-gray-300)")}
                    />
                  </div>
                </div>
              ))}
            </div>

            {visiblePlayers < 4 && (
              <button
                onClick={addPlayer}
                style={{ marginTop: 16, width: "100%", padding: "12px", background: "white", color: "var(--gvg-grass-dark)", fontSize: 15, fontWeight: 600, border: "2px dashed var(--gvg-grass-light)", borderRadius: 12, cursor: "pointer", minHeight: 48 }}
              >
                + Add Player
              </button>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
              <button
                onClick={() => setStep("course")}
                style={{ flex: 1, padding: "14px", background: "white", color: "var(--gvg-gray-700)", fontSize: 15, fontWeight: 600, border: "2px solid var(--gvg-gray-300)", borderRadius: 12, cursor: "pointer", minHeight: 52 }}
              >
                ← Back
              </button>
              <button
                onClick={() => {
                  if (!players[0]?.trim()) return;
                  setStep("confirm");
                }}
                disabled={!players[0]?.trim()}
                style={{ flex: 2, padding: "14px", background: players[0]?.trim() ? "var(--gvg-grass-dark)" : "var(--gvg-gray-300)", color: "white", fontSize: 15, fontWeight: 700, border: "none", borderRadius: 12, cursor: players[0]?.trim() ? "pointer" : "not-allowed", minHeight: 52 }}
              >
                Next: Select Game →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === "confirm" && (
          <div>
            <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 24, fontWeight: 700, color: "var(--gvg-gray-900)", marginBottom: 8 }}>Ready to tee off?</h2>
            <p style={{ fontSize: 14, color: "var(--gvg-gray-600)", marginBottom: 20 }}>Choose your game and review your round details.</p>

            {/* Course & Players summary */}
            <div style={{ background: "var(--gvg-gray-50)", border: "2px solid var(--gvg-gray-200)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gvg-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Course</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "var(--gvg-gray-900)" }}>
                  {selectedCourse ? (courseDisplayName(selectedCourse).name) : courseQuery}
                </div>
                {selectedCourse && courseDisplayName(selectedCourse).loc && (
                  <div style={{ fontSize: 13, color: "var(--gvg-gray-500)" }}>{courseDisplayName(selectedCourse).loc}</div>
                )}
              </div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gvg-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Players</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {activePlayers.map((name, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--gvg-grass-dark)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                      <span style={{ fontSize: 16, fontWeight: 600, color: "var(--gvg-gray-900)" }}>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Catalog */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--gvg-gray-500)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 12 }}>Select a Game</div>
              <GameCatalog
                userTier={userTier}
                selectedGame={selectedGame}
                onSelect={(id, label, rules) => {
                  setSelectedGame(id);
                  setGameLabel(label);
                  setCustomRules(rules ?? null);
                }}
              />
            </div>

            {(error || wolfPlayerError) && (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "2px solid #fecaca", borderRadius: 10, color: "#dc2626", fontSize: 14, marginBottom: 16 }}>
                {error || wolfPlayerError}
              </div>
            )}

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setStep("players")}
                disabled={submitting}
                style={{ flex: 1, padding: "14px", background: "white", color: "var(--gvg-gray-700)", fontSize: 15, fontWeight: 600, border: "2px solid var(--gvg-gray-300)", borderRadius: 12, cursor: "pointer", minHeight: 52 }}
              >
                ← Back
              </button>
              <button
                onClick={createRound}
                disabled={submitting || !!wolfPlayerError}
                style={{ flex: 2, padding: "14px", background: submitting || wolfPlayerError ? "var(--gvg-gray-400)" : "var(--gvg-accent)", color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 12, cursor: submitting || wolfPlayerError ? "not-allowed" : "pointer", minHeight: 52 }}
              >
                {submitting ? "Starting..." : `⛳ Start Round — ${gameLabel}`}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
