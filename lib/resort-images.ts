/**
 * Gradient backgrounds for each resort
 * These create beautiful, consistent visual identities for each resort
 */
export const RESORT_GRADIENTS: Record<string, string> = {
  'palisades-tahoe': 'from-blue-600 via-blue-500 to-cyan-400',
  'mammoth-mountain': 'from-purple-600 via-purple-500 to-pink-400',
  'big-sky': 'from-indigo-600 via-indigo-500 to-blue-400',
  'jackson-hole': 'from-slate-700 via-slate-600 to-gray-500',
  'alta': 'from-blue-700 via-blue-600 to-sky-400',
  'snowbird': 'from-sky-600 via-sky-500 to-blue-400',
  'deer-valley': 'from-emerald-600 via-emerald-500 to-teal-400',
  'solitude': 'from-violet-600 via-violet-500 to-purple-400',
  'aspen-snowmass': 'from-orange-600 via-orange-500 to-red-400',
  'steamboat': 'from-yellow-600 via-yellow-500 to-orange-400',
  'winter-park': 'from-green-600 via-green-500 to-emerald-400',
  'copper-mountain': 'from-amber-700 via-amber-600 to-orange-500',
  'eldora': 'from-teal-600 via-teal-500 to-cyan-400',
  'taos': 'from-rose-600 via-rose-500 to-pink-400',
  'stratton': 'from-green-700 via-green-600 to-emerald-500',
};

/**
 * Get gradient classes for a resort
 */
export function getResortGradient(resortId: string): string {
  return RESORT_GRADIENTS[resortId] || 'from-gray-700 via-gray-600 to-gray-500';
}

/**
 * Pattern overlays to add texture to gradients
 */
export const RESORT_PATTERNS: Record<string, string> = {
  'palisades-tahoe': '⛷️',
  'mammoth-mountain': '🏔️',
  'big-sky': '🌄',
  'jackson-hole': '⛰️',
  'alta': '❄️',
  'snowbird': '🦅',
  'deer-valley': '🦌',
  'solitude': '🌲',
  'aspen-snowmass': '🍂',
  'steamboat': '🚂',
  'winter-park': '🌲',
  'copper-mountain': '⛰️',
  'eldora': '🏔️',
  'taos': '🌵',
  'stratton': '🍁',
};

export function getResortIcon(resortId: string): string {
  return RESORT_PATTERNS[resortId] || '⛷️';
}
