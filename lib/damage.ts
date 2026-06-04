import type { BattleMode, WordCategory } from '../types'
import { getWordCategory } from './dictionary'

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val))
}

export type DamageResult =
  | { type: 'damage'; amount: number; category: WordCategory }
  | { type: 'forbidden'; selfDamage: number; symbolType: 'love' | 'garbage' }
  | { type: 'neutral' }
  | { type: 'invalid' }

export function calculateDamage(
  word: string,
  typingTimeMs: number,
  cadenceScore: number,
  mode: BattleMode
): DamageResult {
  const category = getWordCategory(word)

  if (category === 'invalid') return { type: 'invalid' }
  if (category === 'neutral') return { type: 'neutral' }

  if (category !== mode) {
    return {
      type: 'forbidden',
      selfDamage: 5,
      symbolType: category as 'love' | 'garbage',
    }
  }

  const base = word.length * 2

  const clampedMs = clamp(typingTimeMs, 300, 10_000)
  const speedMultiplier = clampedMs < 1000 ? 2.0 : clampedMs < 2000 ? 1.5 : 1.0

  const clampedCadence = clamp(cadenceScore, 0, 1)
  const cadenceMultiplier = 1.0 + clampedCadence * 0.2

  const damage = clamp(Math.round(base * speedMultiplier * cadenceMultiplier), 1, 50)

  return { type: 'damage', amount: damage, category }
}
