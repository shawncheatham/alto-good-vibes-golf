"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createSideBet, BetType } from "@/lib/actions/sideBets";

interface Player {
  id: string;
  name: string;
  position: number;
}

type ScopeMode = "single" | "range";

const BET_TYPES: {
  type: BetType;
  icon: string;
  name: string;
  desc: string;
  scopeToggle: boolean;
  defaultScope: ScopeMode;
  showParNote: boolean;
}[] = [
  {
    type: "hole",
    icon: "🏌️",
    name: "Bet on Each Hole",
    desc: "Set a dollar value per hole — winner of each hole takes the pot.",
    scopeToggle: true,
    defaultScope: "range",
    showParNote: false,
  },
  {
    type: "drive",
    icon: "💥",
    name: "Longest Drive",
    desc: "Pick a hole — longest drive wins the pot.",
    scopeToggle: false,
    defaultScope: "single",
    showParNote: false,
  },
  {
    type: "pin",
    icon: "🎯",
    name: "Closest to the Pin",
    desc: "Par 3s only — closest to the pin wins.",
    scopeToggle: false,
    defaultScope: "single",
    showParNote: true,
  },
  {
    type: "birdie",
    icon: "🐦",
    name: "Birdie or Better Bonus",
    desc: "Set payout per birdie (or better) scored.",
    scopeToggle: true,
    defaultScope: "range",
    showParNote: false,
  },
  {
    type: "pressure",
    icon: "🔥",
    name: "Last Hole Pressure",
    desc: "Best score on a designated hole wins the pot.",
    scopeToggle: false,
    defaultScope: "single",
    showParNote: false,
  },
];

const HOLES = Array.from({ length: 18 }, (_, i) => i + 1);

export default function NewSideBetPage() {
  const { id: roundId } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Step 1
  const [selectedType, setSelectedType] = useState<BetType | null>(null);

  // Step 2
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [amount, setAmount] = useState("5");
  const [amountError, setAmountError] = useState(false);
  const [scope, setScope] = useState<ScopeMode>("range");
  const [singleHole, setSingleHole] = useState(14);
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(9);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("round_players")
        .select("*")
        .eq("round_id", roundId)
        .order("position");
      if (data) {
        setPlayers(data);
        setSelectedPlayerIds(data.map((p: Player) => p.id));
      }
      setLoading(false);
    };
    load();
  }, [roundId, supabase]);

  const selectedBetConfig = BET_TYPES.find((b) => b.type === selectedType);

  const togglePlayer = (playerId: string) => {
    setSelectedPlayerIds((prev) => {
      if (prev.includes(playerId)) {
        if (prev.length <= 2) return prev; // minimum 2
        return prev.filter((id) => id !== playerId);
      }
      return [...prev, playerId];
    });
  };

  const toggleAll = () => {
    if (selectedPlayerIds.length === players.length) {
      setSelectedPlayerIds(players.slice(0, 2).map((p) => p.id));
    } else {
      setSelectedPlayerIds(players.map((p) => p.id));
    }
  };

  const validateAmount = () => {
    const v = parseFloat(amount);
    const valid = !isNaN(v) && v >= 0.05;
    setAmountError(!valid);
    return valid;
  };

  const handleNext = () => {
    if (step === 1) {
      if (!selectedType) return;
      const config = BET_TYPES.find((b) => b.type === selectedType)!;
      setScope(config.defaultScope);
      setStep(2);
    } else if (step === 2) {
      if (!validateAmount()) return;
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirm = async () => {
    if (!selectedType) return;
    setSubmitting(true);
    setSubmitError(null);

    const holeFrom = scope === "range" ? rangeFrom : singleHole;
    const holeTo = scope === "range" ? rangeTo : singleHole;

    const { error } = await createSideBet(
      roundId,
      selectedType,
      selectedPlayerIds,
      parseFloat(amount),
      holeFrom,
      holeTo
    );

    if (error) {
      setSubmitError(error);
      setSubmitting(false);
      return;
    }

    router.push(`/round/${roundId}/scorecard`);
  };

  const getHoleDisplay = () => {
    if (!selectedBetConfig) return "—";
    if (scope === "range") return `Holes ${rangeFrom}–${rangeTo}`;
    return `Hole ${singleHole}`;
  };

  const getStepTitle = () => {
    if (step === 1) return "Choose Bet Type";
    if (step === 2) return "Configure";
    return "Confirm";
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", background: "white", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: "var(--gvg-gray-500)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⛳</div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", background: "var(--gvg-white)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Sheet Header */}
      <div style={{ background: "var(--gvg-white)", padding: "16px 16px 0", borderBottom: "1px solid var(--gvg-gray-200)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ width: 40, height: 4, background: "var(--gvg-gray-300)", borderRadius: 999, margin: "0 auto 12px" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16 }}>
          <h2 style={{ fontFamily: "var(--gvg-font-display)", fontSize: 20, fontWeight: 700, color: "var(--gvg-gray-800)", margin: 0 }}>
            {getStepTitle()}
          </h2>
          <button
            onClick={() => router.push(`/round/${roundId}/scorecard`)}
            style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--gvg-gray-100)", border: "none", cursor: "pointer", fontSize: 16, color: "var(--gvg-gray-500)", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {/* Step indicator */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 12 }}>
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              style={{
                height: 8,
                borderRadius: 999,
                transition: "all 0.2s",
                background: s <= step ? "var(--gvg-grass)" : "var(--gvg-gray-300)",
                width: s === step ? 24 : 8,
                opacity: s < step ? 0.5 : 1,
              }}
            />
          ))}
          <span style={{ fontSize: 12, color: "var(--gvg-gray-500)", marginLeft: 8 }}>Step {step} of 3</span>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 16px 120px", overflowY: "auto" }}>

        {/* Step 1: Bet Type */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {BET_TYPES.map((bt) => {
              const isSelected = selectedType === bt.type;
              return (
                <div
                  key={bt.type}
                  onClick={() => setSelectedType(bt.type)}
                  style={{
                    background: isSelected ? "#f0fdf4" : "var(--gvg-white)",
                    borderRadius: 16,
                    padding: "16px 20px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    border: `2px solid ${isSelected ? "var(--gvg-grass)" : "transparent"}`,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{bt.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--gvg-gray-800)", marginBottom: 2 }}>{bt.name}</div>
                    <div style={{ fontSize: 14, color: "var(--gvg-gray-500)", lineHeight: 1.4 }}>{bt.desc}</div>
                  </div>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: `2px solid ${isSelected ? "var(--gvg-grass)" : "var(--gvg-gray-300)"}`,
                    background: isSelected ? "var(--gvg-grass)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    color: "white", fontSize: 13, fontWeight: 700,
                  }}>
                    {isSelected && "✓"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Step 2: Configure */}
        {step === 2 && selectedBetConfig && (
          <div>
            {/* Two-column: Players + Amount */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
              {/* Players */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gvg-gray-500)", marginBottom: 8 }}>
                  Who&apos;s in?
                </div>
                <button
                  onClick={toggleAll}
                  style={{ fontSize: 12, color: "var(--gvg-grass)", fontWeight: 600, cursor: "pointer", background: "none", border: "none", padding: 0, marginBottom: 8, display: "inline-block" }}
                >
                  {selectedPlayerIds.length === players.length ? "Deselect all" : "Select all"}
                </button>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {players.map((p) => {
                    const isSelected = selectedPlayerIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlayer(p.id)}
                        style={{
                          background: isSelected ? "#f0fdf4" : "var(--gvg-white)",
                          borderRadius: 12,
                          padding: "10px 12px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          border: `2px solid ${isSelected ? "var(--gvg-grass)" : "transparent"}`,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          transition: "all 0.15s",
                        }}
                      >
                        <div style={{ flex: 1, fontWeight: 600, color: "var(--gvg-gray-800)", fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.name}
                        </div>
                        <div style={{
                          width: 20, height: 20, borderRadius: "50%",
                          border: `2px solid ${isSelected ? "var(--gvg-grass)" : "var(--gvg-gray-300)"}`,
                          background: isSelected ? "var(--gvg-grass)" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: 11,
                          flexShrink: 0,
                        }}>
                          {isSelected && "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--gvg-gray-700)", marginBottom: 8 }}>
                  Bet Amount
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gvg-gray-500)", fontSize: 16, pointerEvents: "none" }}>$</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.05"
                    min="0.05"
                    step="0.05"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setAmountError(false); }}
                    style={{
                      width: "100%",
                      padding: "12px 12px 12px 26px",
                      border: `1.5px solid ${amountError ? "var(--gvg-error)" : "var(--gvg-gray-300)"}`,
                      borderRadius: 8,
                      fontSize: 16,
                      color: "var(--gvg-gray-800)",
                      background: "var(--gvg-white)",
                      WebkitAppearance: "none",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                {amountError && (
                  <p style={{ fontSize: 12, color: "var(--gvg-error)", marginTop: 4 }}>Min $0.05</p>
                )}
                <p style={{ fontSize: 12, color: "var(--gvg-gray-400)", marginTop: 6, lineHeight: 1.5 }}>
                  Per hole or per event depending on bet type
                </p>
              </div>
            </div>

            {/* Hole scope */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gvg-gray-500)", marginBottom: 8 }}>
                {selectedBetConfig.type === "hole" || selectedBetConfig.type === "birdie" ? "Hole Range" :
                 selectedBetConfig.type === "pin" ? "Which hole? (par 3)" : "Which hole?"}
              </div>

              {/* Scope toggle (hole + birdie only) */}
              {selectedBetConfig.scopeToggle && (
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  {(["single", "range"] as ScopeMode[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setScope(s)}
                      style={{
                        flex: 1, padding: "8px 12px",
                        border: `1.5px solid ${scope === s ? "var(--gvg-grass)" : "var(--gvg-gray-300)"}`,
                        borderRadius: 8,
                        background: scope === s ? "#f0fdf4" : "var(--gvg-white)",
                        fontSize: 14, fontWeight: 600,
                        color: scope === s ? "var(--gvg-grass-dark)" : "var(--gvg-gray-700)",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {s === "single" ? "Single hole" : "Hole range"}
                    </button>
                  ))}
                </div>
              )}

              {/* Single hole picker */}
              {(scope === "single" || !selectedBetConfig.scopeToggle) && (
                <div>
                  <select
                    value={singleHole}
                    onChange={(e) => setSingleHole(Number(e.target.value))}
                    style={{ width: "100%", padding: "12px", border: "1.5px solid var(--gvg-gray-300)", borderRadius: 8, fontSize: 16, color: "var(--gvg-gray-800)", background: "var(--gvg-white)", boxSizing: "border-box" }}
                  >
                    {HOLES.map((h) => (
                      <option key={h} value={h}>Hole {h}</option>
                    ))}
                  </select>

                  {/* Par 3 note for pin bets */}
                  {selectedBetConfig.showParNote && (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 12, color: "#92400e", lineHeight: 1.5, marginTop: 12 }}>
                      ⚠️ Verify this is a par 3 — par data unavailable from course API.
                    </div>
                  )}
                </div>
              )}

              {/* Range picker */}
              {scope === "range" && selectedBetConfig.scopeToggle && (
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <select
                    value={rangeFrom}
                    onChange={(e) => setRangeFrom(Number(e.target.value))}
                    style={{ flex: 1, padding: "12px", border: "1.5px solid var(--gvg-gray-300)", borderRadius: 8, fontSize: 16, color: "var(--gvg-gray-800)", background: "var(--gvg-white)" }}
                  >
                    {HOLES.map((h) => (
                      <option key={h} value={h}>H{h}</option>
                    ))}
                  </select>
                  <span style={{ color: "var(--gvg-gray-500)", fontSize: 14, flexShrink: 0 }}>to</span>
                  <select
                    value={rangeTo}
                    onChange={(e) => setRangeTo(Number(e.target.value))}
                    style={{ flex: 1, padding: "12px", border: "1.5px solid var(--gvg-gray-300)", borderRadius: 8, fontSize: 16, color: "var(--gvg-gray-800)", background: "var(--gvg-white)" }}
                  >
                    {HOLES.map((h) => (
                      <option key={h} value={h}>H{h}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && selectedBetConfig && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--gvg-gray-500)", marginBottom: 12 }}>
              Review your side bet
            </div>
            <div style={{ background: "var(--gvg-white)", borderRadius: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", overflow: "hidden", marginBottom: 16 }}>
              {[
                { label: "Bet Type", value: `${selectedBetConfig.icon} ${selectedBetConfig.name}` },
                { label: "Players", value: players.filter((p) => selectedPlayerIds.includes(p.id)).map((p) => p.name).join(", ") },
                { label: "Hole(s)", value: getHoleDisplay() },
                { label: "Bet Amount", value: `$${parseFloat(amount).toFixed(2)}`, accent: true },
              ].map(({ label, value, accent }, i, arr) => (
                <div key={label} style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "16px 20px", borderBottom: i < arr.length - 1 ? "1px solid var(--gvg-gray-100)" : "none" }}>
                  <span style={{ fontSize: 14, color: "var(--gvg-gray-500)", fontWeight: 500 }}>{label}</span>
                  <span style={{ fontWeight: 700, color: accent ? "var(--gvg-accent)" : "var(--gvg-gray-800)", textAlign: "right", maxWidth: "60%", fontSize: accent ? 18 : 15 }}>{value}</span>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 14, color: "var(--gvg-gray-400)", lineHeight: 1.6 }}>
              Once confirmed, 🎲 appears on applicable holes in the strip. Settlement shown at recap — handled off-app.
            </p>
            {submitError && (
              <p style={{ fontSize: 14, color: "var(--gvg-error)", marginTop: 8 }}>{submitError}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "var(--gvg-white)", padding: 16, borderTop: "1px solid var(--gvg-gray-200)", display: "flex", gap: 12, maxWidth: 480, margin: "0 auto", zIndex: 50 }}>
        {step > 1 && (
          <button
            onClick={handleBack}
            style={{ flex: 1, padding: 16, background: "var(--gvg-gray-100)", color: "var(--gvg-gray-700)", fontSize: 16, fontWeight: 600, border: "none", borderRadius: 8, cursor: "pointer" }}
          >
            Back
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={handleNext}
            disabled={step === 1 && !selectedType}
            style={{
              flex: 2, padding: 16,
              background: (step === 1 && !selectedType) ? "var(--gvg-gray-300)" : "var(--gvg-grass)",
              color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 8,
              cursor: (step === 1 && !selectedType) ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        ) : (
          <button
            onClick={handleConfirm}
            disabled={submitting}
            style={{
              flex: 2, padding: 16,
              background: submitting ? "var(--gvg-gray-300)" : "var(--gvg-accent)",
              color: "white", fontSize: 16, fontWeight: 700, border: "none", borderRadius: 8,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Adding..." : "🎲 Start Side Bet"}
          </button>
        )}
      </div>
    </div>
  );
}
