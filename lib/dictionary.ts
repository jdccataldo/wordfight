import { readFileSync } from 'fs'
import { join } from 'path'

let spanishWords: Set<string> | null = null
let loveWords: Set<string> | null = null
let garbageWords: Set<string> | null = null

function normalize(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function loadWordFile(filename: string): Set<string> {
  const raw = readFileSync(join(process.cwd(), 'data', filename), 'utf8')
  const set = new Set<string>()
  for (const line of raw.split('\n')) {
    const w = line.trim()
    if (w) {
      set.add(w)
      set.add(normalize(w))
    }
  }
  return set
}

export function loadDictionaries(): void {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const allSpanish: string[] = require('an-array-of-spanish-words')
  spanishWords = new Set(allSpanish.map(w => w.toLowerCase()))

  loveWords = loadWordFile('love-words.txt')
  garbageWords = loadWordFile('garbage-words.txt')

  console.log(`Dictionary loaded: ${spanishWords.size} Spanish words, ${loveWords.size} love, ${garbageWords.size} garbage`)
}

import type { WordCategory } from '../types'

export function getWordCategory(word: string): WordCategory {
  if (!spanishWords || !loveWords || !garbageWords) {
    throw new Error('Dictionaries not loaded')
  }

  const w = word.toLowerCase()
  const wn = normalize(word)

  if (loveWords.has(w) || loveWords.has(wn)) return 'love'
  if (garbageWords.has(w) || garbageWords.has(wn)) return 'garbage'
  if (spanishWords.has(w) || spanishWords.has(wn)) return 'neutral'
  return 'invalid'
}
