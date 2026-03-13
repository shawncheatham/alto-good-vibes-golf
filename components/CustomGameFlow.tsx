'use client';

import { useState, useRef, useEffect } from 'react';
import { GAMES, GameId, isOffTopic } from '@/lib/games';
import { CustomRules } from './GameCatalog';

interface Message {
  role: 'ai' | 'user';
  content: string;
}

interface CustomGameFlowProps {
  onConfirm: (label: string, rules: CustomRules) => void;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

const BASE_GAMES: GameId[] = ['skins', 'nassau', 'matchplay', 'stableford', 'wolf', 'chaosskins'];

export default function CustomGameFlow({ onConfirm, onClose }: CustomGameFlowProps) {
  const [step, setStep] = useState<Step>(1);
  const [baseGame, setBaseGame] = useState<GameId | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loopCount, setLoopCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showGuardrail, setShowGuardrail] = useState(false);
  const [confirmedRules, setConfirmedRules] = useState<{ text: string; structured: CustomRules } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const guardrailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conversationHistoryRef = useRef<{ role: 'user' | 'assistant'; content: string }[]>([]);

  // Speech recognition (Web Speech API — types declared inline for browser compat)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const speechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectBaseGame = (id: GameId) => {
    setBaseGame(id);
    const game = GAMES[id];
    setTimeout(() => {
      setStep(2);
      setMessages([{
        role: 'ai',
        content: `Got it — we're playing ${game.name}. Describe your scoring or rule tweaks and I'll apply them to the round.`,
      }]);
      conversationHistoryRef.current = [];
      setLoopCount(0);
      setInputValue('');
    }, 300);
  };

  const handleMicClick = () => {
    if (!speechSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) return;

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const sendMessage = async () => {
    const text = inputValue.trim();
    if (!text || !baseGame || loading) return;

    // Guardrail check before API call
    if (isOffTopic(text)) {
      setShowGuardrail(true);
      setInputValue('');
      if (guardrailTimerRef.current) clearTimeout(guardrailTimerRef.current);
      guardrailTimerRef.current = setTimeout(() => setShowGuardrail(false), 4000);
      return;
    }

    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    const newHistory = [
      ...conversationHistoryRef.current,
      { role: 'user' as const, content: text },
    ];

    try {
      const res = await fetch('/api/games/parse-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          baseGame,
          conversationHistory: conversationHistoryRef.current,
          loopCount,
        }),
      });

      const data = await res.json() as {
        type: string;
        message: string;
        structuredRules?: CustomRules;
      };

      if (data.type === 'guardrail') {
        setShowGuardrail(true);
        if (guardrailTimerRef.current) clearTimeout(guardrailTimerRef.current);
        guardrailTimerRef.current = setTimeout(() => setShowGuardrail(false), 4000);
        setMessages(prev => prev.filter((_, i) => i < prev.length - 1)); // remove user msg
        setLoading(false);
        return;
      }

      const assistantMessage = data.message || data.type;
      conversationHistoryRef.current = [
        ...newHistory,
        { role: 'assistant' as const, content: assistantMessage },
      ];

      const newLoopCount = loopCount + 1;
      setLoopCount(newLoopCount);

      if (data.type === 'summary' && data.structuredRules) {
        setConfirmedRules({ text: assistantMessage, structured: data.structuredRules });
        setMessages(prev => [...prev, { role: 'ai', content: assistantMessage }]);
        setStep(3);
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: assistantMessage }]);

        // Force to step 3 after 3 loops even without explicit summary
        if (newLoopCount >= 3) {
          setConfirmedRules({
            text: assistantMessage,
            structured: { base_game: baseGame, summary: assistantMessage, rule_tweaks: [] },
          });
          setTimeout(() => setStep(3), 500);
        }
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Sorry, something went wrong. Please try again.' }]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleConfirm = () => {
    if (!baseGame || !confirmedRules) return;
    const game = GAMES[baseGame];
    const label = `Custom ${game.name}`;
    onConfirm(label, confirmedRules.structured);
  };

  const stepIndicator = (n: 1 | 2 | 3, label: string) => {
    const isDone = step > n;
    const isActive = step === n;
    return (
      <div
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 700,
          textAlign: 'center',
          background: isDone ? 'var(--gvg-grass)' : isActive ? '#f0fdf4' : 'var(--gvg-gray-100)',
          color: isDone ? 'white' : isActive ? 'var(--gvg-grass)' : 'var(--gvg-gray-400)',
          border: `1.5px solid ${isDone ? 'var(--gvg-grass)' : isActive ? 'var(--gvg-grass)' : 'transparent'}`,
        }}
      >
        {label}
      </div>
    );
  };

  const remainingClarifications = Math.max(0, 3 - loopCount);

  return (
    <div
      data-testid="custom-game-flow"
      style={{
        background: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '2px solid var(--gvg-grass)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 24 }}>✨</span>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--gvg-grass-dark)', flex: 1 }}>
          Custom Game
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: 20, color: 'var(--gvg-gray-400)', cursor: 'pointer', padding: 4, lineHeight: 1 }}
          aria-label="Close custom game flow"
        >
          ✕
        </button>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {stepIndicator(1, '1 · Base Game')}
        {stepIndicator(2, '2 · Your Rules')}
        {stepIndicator(3, '3 · Confirm')}
      </div>

      {/* Step 1: Pick base game */}
      {step === 1 && (
        <div>
          <p style={{ fontSize: 14, color: 'var(--gvg-gray-600)', marginBottom: 12, lineHeight: 1.5 }}>
            Which game would you like to build on?
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {BASE_GAMES.map(id => {
              const game = GAMES[id];
              return (
                <button
                  key={id}
                  data-testid={`base-game-btn-${id}`}
                  onClick={() => selectBaseGame(id)}
                  style={{
                    padding: '12px',
                    background: baseGame === id ? '#f0fdf4' : 'var(--gvg-gray-100)',
                    border: `1.5px solid ${baseGame === id ? 'var(--gvg-grass)' : 'var(--gvg-gray-200)'}`,
                    borderRadius: 8,
                    fontSize: 14,
                    fontWeight: 600,
                    color: baseGame === id ? 'var(--gvg-grass-dark)' : 'var(--gvg-gray-700)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{game.emoji}</span>
                  {game.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Step 2: AI chat */}
      {step === 2 && baseGame && (
        <div>
          {/* Base indicator */}
          <div style={{ background: 'var(--gvg-gray-100)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, fontSize: 14 }}>
            Base: <strong>{GAMES[baseGame].emoji} {GAMES[baseGame].name}</strong> · Describe your scoring or rule tweaks below.
          </div>

          {/* Guardrail warning */}
          {showGuardrail && (
            <div
              data-testid="guardrail-warning"
              style={{
                background: '#fffbeb',
                border: '1px solid var(--gvg-warning)',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 12,
                fontSize: 14,
                color: '#92400e',
              }}
            >
              ⚠️ Keep it to scoring and rule tweaks on {GAMES[baseGame].name}. I can&apos;t help with anything outside golf game mechanics.
            </div>
          )}

          {/* Messages */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              marginBottom: 16,
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  background: msg.role === 'ai' ? 'var(--gvg-gray-100)' : 'var(--gvg-grass)',
                  color: msg.role === 'ai' ? 'var(--gvg-gray-700)' : 'white',
                  padding: '12px 16px',
                  borderRadius: msg.role === 'ai' ? '12px 12px 12px 4px' : '12px 12px 4px 12px',
                  fontSize: 14,
                  lineHeight: 1.5,
                  alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end',
                  maxWidth: '92%',
                }}
              >
                {msg.role === 'ai' && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gvg-grass)', marginBottom: 4 }}>GVG AI</div>
                )}
                {msg.content}
              </div>
            ))}
            {loading && (
              <div style={{ alignSelf: 'flex-start', fontSize: 14, color: 'var(--gvg-gray-400)', padding: '8px 16px' }}>
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input row */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. Double the skin on par 3s…"
              rows={2}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1.5px solid var(--gvg-gray-300)',
                borderRadius: 8,
                fontSize: 16,
                fontFamily: 'inherit',
                resize: 'none',
                minHeight: 48,
                outline: 'none',
              }}
              disabled={loading}
            />
            <button
              onClick={handleMicClick}
              aria-label={isListening ? 'Stop listening' : 'Voice input'}
              title={speechSupported ? (isListening ? 'Stop listening' : 'Voice input') : 'Voice input not supported'}
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: isListening ? 'var(--gvg-accent)' : 'var(--gvg-gray-200)',
                border: 'none',
                fontSize: 20,
                cursor: speechSupported ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: speechSupported ? 1 : 0.5,
              }}
            >
              🎤
            </button>
            <button
              onClick={sendMessage}
              disabled={loading || !inputValue.trim()}
              aria-label="Send"
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--gvg-grass)',
                color: 'white',
                border: 'none',
                fontSize: 20,
                cursor: loading || !inputValue.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                opacity: loading || !inputValue.trim() ? 0.5 : 1,
                transition: 'background 0.15s',
              }}
            >
              →
            </button>
          </div>

          <div style={{ fontSize: 11, color: 'var(--gvg-gray-400)', textAlign: 'right', marginTop: 8 }}>
            {remainingClarifications > 0
              ? `Up to ${remainingClarifications} clarification${remainingClarifications !== 1 ? 's' : ''} remaining`
              : ''}
          </div>

          <button
            onClick={() => { setStep(1); setBaseGame(null); setMessages([]); }}
            style={{ width: '100%', padding: '10px', background: 'none', color: 'var(--gvg-gray-500)', fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8, textDecoration: 'underline' }}
          >
            ← Change base game
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && confirmedRules && baseGame && (
        <div>
          {/* Summary */}
          <div
            data-testid="rules-summary"
            style={{
              background: '#f0fdf4',
              border: '1.5px solid #86efac',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gvg-grass)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Custom {GAMES[baseGame].name} · Your Rules
            </div>
            <div style={{ fontSize: 14, color: 'var(--gvg-gray-700)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {confirmedRules.structured.summary || confirmedRules.text}
            </div>
            {confirmedRules.structured.rule_tweaks && confirmedRules.structured.rule_tweaks.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20 }}>
                {confirmedRules.structured.rule_tweaks.map((tweak, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--gvg-gray-700)', marginBottom: 4 }}>{tweak}</li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={handleConfirm}
            data-testid="confirm-custom-rules"
            style={{
              width: '100%',
              padding: '14px',
              background: 'var(--gvg-accent)',
              color: 'white',
              fontSize: 16,
              fontWeight: 700,
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              marginTop: 4,
              transition: 'background 0.15s',
            }}
          >
            ✓ Use These Rules
          </button>

          <button
            onClick={() => setStep(2)}
            style={{ width: '100%', padding: '10px', background: 'none', color: 'var(--gvg-gray-500)', fontSize: 14, border: 'none', cursor: 'pointer', marginTop: 8, textDecoration: 'underline' }}
          >
            ← Edit rules
          </button>
        </div>
      )}
    </div>
  );
}
