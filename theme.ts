// Colors pulled from the logo: blue "SLUŠAJ", yellow "SAD", red-orange "OVO", dark background
export const theme = {
  // Core brand colors from the logo
  blue: '#45B8E8',       // "SLUŠAJ" blue
  yellow: '#F4B833',     // "SAD" yellow
  orange: '#E8481C',     // "OVO" orange-red

  // UI surfaces
  headerBg: '#111111',   // dark background matching logo backdrop
  screenBg: '#F7F7F7',
  cardBg: '#FFFFFF',

  // Tab bar
  tabActive: '#45B8E8',
  tabInactive: '#9CA3AF',
  tabBar: '#FFFFFF',

  // Text
  textPrimary: '#111111',
  textSecondary: '#6B7280',
  textLight: '#FFFFFF',

  // Misc
  border: '#E5E7EB',
  avatarBg: '#1E1E1E',
  iconBg: '#1E2A35',
} as const;
