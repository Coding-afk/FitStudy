export const BADGES = {
  game_on: {
    id: 'game_on',
    name: 'Game On',
    shortLabel: 'GO',
    symbol: '🕹️',
    description: 'Complete your first gamified workout.',
  },

  perfect_start: {
    id: 'perfect_start',
    name: 'Perfect Start',
    shortLabel: 'PS',
    symbol: '👟',
    description: 'Complete your first perfect gamified workout.',
  },

  challenge_accepted: {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    shortLabel: 'CA',
    symbol: '🤺',
    description: 'Complete your first workout challenge.',
  },

  xp_hunter: {
    id: 'xp_hunter',
    name: 'XP Hunter',
    shortLabel: 'XP',
    symbol: '🏹',
    description: 'Earn a total of 500 XP.',
  },

  high_achiever: {
    id: 'high_achiever',
    name: 'High Achiever',
    shortLabel: 'HA',
    symbol: '🧗',
    description: 'Reach Level 3.',
  },

  perfect_pair: {
    id: 'perfect_pair',
    name: 'Perfect Pair',
    shortLabel: 'PP',
    symbol: '⚔️',
    description: 'Complete two perfect gamified workouts.',
  },

  champion: {
    id: 'champion',
    name: 'Champion',
    shortLabel: 'CH',
    symbol: '🏆',
    description: 'Reach Level 5.',
  },

  game_complete: {
    id: 'game_complete',
    name: 'Game Complete',
    shortLabel: 'GC',
    symbol: '👑',
    description: 'Complete all 5 gamified workouts.',
  },

  fitstudy_complete: {
    id: 'fitstudy_complete',
    name: 'FitStudy Complete',
    shortLabel: 'FC',
    symbol: '🏅',
    description: 'Complete all 10 study workouts and finish the Perfect Workout.',
  },
};

export const BADGE_ORDER = [
  'game_on',
  'perfect_start',
  'challenge_accepted',
  'xp_hunter',
  'high_achiever',
  'perfect_pair',
  'champion',
  'game_complete',
  'fitstudy_complete',
];

export const getBadgeDefinition = badgeId => {
  return (
    BADGES[badgeId] ?? {
      id: badgeId,
      name: 'Achievement',
      shortLabel: '?',
      symbol: '★',
      description: 'Gamification achievement unlocked.',
    }
  );
};

export const getAllBadges = () => {
  return BADGE_ORDER.map(badgeId => BADGES[badgeId]);
};
