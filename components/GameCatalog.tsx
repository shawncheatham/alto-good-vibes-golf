'use client';

import { useState } from 'react';
import { GAMES, TIER_RANK, Tier, GameId } from '@/lib/games';
import CustomGameFlow from './CustomGameFlow';
import UpgradeModal from './UpgradeModal';

export interface CustomRules {
  base_game?: string;
  summary?: string;
  rule_tweaks?: string[];
}

interface GameCatalogProps {
  userTier: Tier;
  selectedGame: string;
  onSelect: (gameId: string, label: string, customRules?: CustomRules) => void;
}

function tierLabel(tier: Tier): string {
  return { free: 'Free', grounds_keeper: 'Grounds Keeper', players_club: 'Players Club' }[tier];
}

export default function GameCatalog({ userTier, selectedGame, onSelect }: GameCatalogProps) {
  const [expandedGame, setExpandedGame] = useState<GameId | null>(null);
  const [showCustomFlow, setShowCustomFlow] = useState(false);
  const [upgradeModalTier, setUpgradeModalTier] = useState<'grounds_keeper' | 'players_club' | null>(null);
  const [upgradeGameName, setUpgradeGameName] = useState('');

  const hasAccess = (gameId: GameId) => {
    const game = GAMES[gameId];
    return TIER_RANK[userTier] >= TIER_RANK[game.tier];
  };

  const handleCardTap = (gameId: GameId) => {
    const game = GAMES[gameId];

    // Locked → show upgrade modal
    if (!hasAccess(gameId)) {
      setUpgradeGameName(game.name);
      setUpgradeModalTier(game.tier as 'grounds_keeper' | 'players_club');
      return;
    }

    // Custom → open custom flow
    if (gameId === 'custom') {
      setExpandedGame(null);
      setShowCustomFlow(true);
      return;
    }

    // Toggle inline detail
    if (expandedGame === gameId) {
      setExpandedGame(null);
    } else {
      setExpandedGame(gameId);
      setShowCustomFlow(false);
    }
  };

  const handleSelectFromDetail = () => {
    if (!expandedGame) return;
    const game = GAMES[expandedGame];
    onSelect(expandedGame, game.name);
    setExpandedGame(null);
  };

  const handleCustomConfirm = (label: string, rules: CustomRules) => {
    onSelect('custom', label, rules);
    setShowCustomFlow(false);
  };

  const gameIds = Object.keys(GAMES) as GameId[];

  return (
    <div>
      {/* Horizontal scroll carousel */}
      <div
        style={{
          overflowX: 'auto',
          overflowY: 'visible',
          display: 'flex',
          gap: 12,
          padding: '8px 4px 16px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          scrollSnapType: 'x mandatory',
        }}
      >
        {gameIds.map(gameId => {
          const game = GAMES[gameId];
          const locked = !hasAccess(gameId);
          const isSelected = selectedGame === gameId;
          const isExpanded = expandedGame === gameId;

          return (
            <div
              key={gameId}
              data-testid={`game-card-${gameId}`}
              onClick={() => handleCardTap(gameId)}
              style={{
                flexShrink: 0,
                width: 190,
                background: isSelected ? '#f0fdf4' : 'white',
                borderRadius: 16,
                padding: 16,
                border: `2px solid ${isSelected ? 'var(--gvg-grass)' : isExpanded ? 'var(--gvg-grass)' : 'transparent'}`,
                boxShadow: isSelected
                  ? '0 0 0 4px rgba(45,122,79,0.2), var(--shadow-sm)'
                  : isExpanded
                  ? '0 0 0 3px rgba(45,122,79,0.15), var(--shadow-sm)'
                  : '0 1px 3px rgba(0,0,0,0.1)',
                cursor: locked ? 'default' : 'pointer',
                opacity: locked ? 0.75 : 1,
                transition: 'all 0.15s',
                scrollSnapAlign: 'start',
                position: 'relative',
              }}
            >
              {/* Selected checkmark badge */}
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--gvg-grass)',
                    color: 'white',
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  ✓
                </div>
              )}

              {/* Upgrade badge for locked games */}
              {locked && !isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'var(--gvg-accent)',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 999,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {game.tier === 'players_club' ? 'Players Club' : 'Upgrade'}
                </div>
              )}

              <span style={{ fontSize: 34, marginBottom: 8, display: 'block' }}>{game.emoji}</span>
              <div
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--gvg-grass-dark)',
                  marginBottom: 4,
                }}
              >
                {game.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gvg-gray-500)', marginBottom: 8 }}>
                {game.minPlayersLabel} players · {tierLabel(game.tier)}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--gvg-gray-600)',
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                } as React.CSSProperties}
              >
                {game.rules}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inline detail panel */}
      {expandedGame && !showCustomFlow && (
        <div
          data-testid="game-detail-panel"
          style={{
            background: 'white',
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            border: '2px solid var(--gvg-grass)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 36, flexShrink: 0 }}>{GAMES[expandedGame].emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--gvg-grass-dark)' }}>
                {GAMES[expandedGame].name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gvg-gray-500)', marginTop: 4 }}>
                {GAMES[expandedGame].minPlayersLabel} players · {tierLabel(GAMES[expandedGame].tier)}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: 'var(--gvg-gray-700)', lineHeight: 1.6, marginBottom: 16 }}>
            {GAMES[expandedGame].rules}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleSelectFromDetail}
              data-testid="select-game-btn"
              style={{
                flex: 1,
                padding: '12px',
                background: selectedGame === expandedGame ? 'var(--gvg-gray-200)' : 'var(--gvg-grass)',
                color: selectedGame === expandedGame ? 'var(--gvg-gray-600)' : 'white',
                fontSize: 14,
                fontWeight: 700,
                border: 'none',
                borderRadius: 8,
                cursor: selectedGame === expandedGame ? 'default' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {selectedGame === expandedGame ? '✓ Selected' : 'Select this game'}
            </button>
            <button
              onClick={() => setExpandedGame(null)}
              style={{
                padding: '12px 16px',
                background: 'var(--gvg-gray-100)',
                color: 'var(--gvg-gray-700)',
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Custom game flow */}
      {showCustomFlow && (
        <CustomGameFlow
          onConfirm={handleCustomConfirm}
          onClose={() => setShowCustomFlow(false)}
        />
      )}

      {/* Upgrade modal */}
      {upgradeModalTier && (
        <UpgradeModal
          tier={upgradeModalTier}
          gameName={upgradeGameName}
          onClose={() => setUpgradeModalTier(null)}
        />
      )}
    </div>
  );
}
