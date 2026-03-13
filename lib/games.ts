export const GAMES = {
  skins: {
    id: 'skins',
    name: 'Skins',
    emoji: '🎯',
    tier: 'free' as const,
    minPlayers: 2,
    minPlayersLabel: '2+',
    rules: 'Low score on each hole wins 1 skin. Ties carry the pot to the next hole. Most skins after 18 wins.',
  },
  nassau: {
    id: 'nassau',
    name: 'Nassau',
    emoji: '⛳',
    tier: 'grounds_keeper' as const,
    minPlayers: 2,
    minPlayersLabel: '2+',
    rules: 'Three separate bets: front 9, back 9, and overall 18. Low total score wins each segment.',
  },
  matchplay: {
    id: 'matchplay',
    name: 'Match Play',
    emoji: '🤝',
    tier: 'grounds_keeper' as const,
    minPlayers: 2,
    minPlayersLabel: '2',
    rules: 'Head-to-head, hole by hole. Win a hole, earn a point. Tie = no points. First to win more holes than remain wins.',
  },
  stableford: {
    id: 'stableford',
    name: 'Stableford',
    emoji: '📊',
    tier: 'grounds_keeper' as const,
    minPlayers: 1,
    minPlayersLabel: '1+',
    rules: 'Points per hole vs par (par=4): Eagle 4pts, Birdie 3pts, Par 2pts, Bogey 1pt, Double bogey+ 0pts. High score wins.',
  },
  wolf: {
    id: 'wolf',
    name: 'Wolf',
    emoji: '🐺',
    tier: 'grounds_keeper' as const,
    minPlayers: 4,
    minPlayersLabel: '4',
    rules: 'Rotating wolf picks a partner after each tee shot, or goes lone wolf for double stakes. Low team score wins the hole.',
  },
  chaosskins: {
    id: 'chaosskins',
    name: 'Chaos Skins',
    emoji: '🎲',
    tier: 'grounds_keeper' as const,
    minPlayers: 2,
    minPlayersLabel: '2+',
    rules: 'Standard skins but each hole has a hidden multiplier (1×, 2×, 3×) revealed at the start of the hole.',
  },
  custom: {
    id: 'custom',
    name: 'Custom',
    emoji: '✨',
    tier: 'players_club' as const,
    minPlayers: 2,
    minPlayersLabel: '2+',
    rules: 'Pick a base game and describe your rule tweaks. AI applies them to the round.',
  },
} as const;

export type GameId = keyof typeof GAMES;
export type Tier = 'free' | 'grounds_keeper' | 'players_club';
export const TIER_RANK: Record<Tier, number> = { free: 0, grounds_keeper: 1, players_club: 2 };

export const OFF_TOPIC_PATTERNS = [
  /ignore (previous|above|prior|all)/i,
  /you are now/i,
  /pretend (you|to)/i,
  /act as/i,
  /jailbreak/i,
  /forget (everything|your|the)/i,
  /\b(weather|recipe|code|hack|password|politics|stock|crypto)\b/i,
];

const GOLF_TERMS = /\b(hole|par|birdie|eagle|bogey|skin|putt|stroke|drive|handicap|match|point|score|round|front|back|carry|double|triple|bet|win|lose|tie|play|player|team)\b/i;

export function isOffTopic(input: string): boolean {
  if (OFF_TOPIC_PATTERNS.some(p => p.test(input))) return true;
  return !GOLF_TERMS.test(input);
}
