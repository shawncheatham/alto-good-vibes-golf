export type GameCategory = 'free' | 'standard' | 'custom'
export type UserTier = 'free' | 'grounds_keeper' | 'players_club'

export interface Game {
  id: string
  name: string
  description: string
  icon: string
  category: GameCategory
}

export const GAMES: Game[] = [
  {
    id: 'skins',
    name: 'Skins',
    description: 'Low score wins the hole. Ties carry over.',
    icon: '🎯',
    category: 'free',
  },
  {
    id: 'nassau',
    name: 'Nassau',
    description: 'Three bets: front 9, back 9, and overall.',
    icon: '⛳',
    category: 'standard',
  },
  {
    id: 'match-play',
    name: 'Match Play',
    description: 'Win the hole, win a point. Most points wins.',
    icon: '🤝',
    category: 'standard',
  },
  {
    id: 'stableford',
    name: 'Stableford',
    description: 'Points-based scoring. High score wins.',
    icon: '📊',
    category: 'standard',
  },
  {
    id: 'custom-game',
    name: 'Custom Game',
    description: 'Create your own format. Your rules, your way.',
    icon: '✨',
    category: 'custom',
  },
  {
    id: 'side-bets',
    name: 'Side Bets',
    description: 'Add mid-round action. Closest to pin, longest drive, etc.',
    icon: '💰',
    category: 'custom',
  },
]

const TIER_LEVELS: Record<UserTier, number> = {
  free: 0,
  grounds_keeper: 1,
  players_club: 2,
}

const CATEGORY_REQUIRED_TIER: Record<GameCategory, UserTier> = {
  free: 'free',
  standard: 'grounds_keeper',
  custom: 'players_club',
}

export function getRequiredTier(gameId: string): UserTier {
  const game = GAMES.find(g => g.id === gameId)
  if (!game) return 'players_club'
  return CATEGORY_REQUIRED_TIER[game.category]
}

export function canAccessGame(userTier: string, gameId: string): boolean {
  const required = getRequiredTier(gameId)
  const userLevel = TIER_LEVELS[userTier as UserTier] ?? 0
  const requiredLevel = TIER_LEVELS[required]
  return userLevel >= requiredLevel
}
