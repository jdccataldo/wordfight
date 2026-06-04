import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'

type WordEntry = { love: number; garbage: number }
type WordMap = Record<string, WordEntry>

const DATA_DIR = () => join(process.cwd(), 'data')
const JSON_PATH = () => join(DATA_DIR(), 'uncategorized-words.json')
const MD_PATH = () => join(DATA_DIR(), 'uncategorized-words.md')

let wordMap: WordMap = {}

export function loadUncategorizedWords(): void {
  const jsonPath = JSON_PATH()
  if (existsSync(jsonPath)) {
    try {
      const raw = readFileSync(jsonPath, 'utf8')
      wordMap = JSON.parse(raw) as WordMap
      const total = Object.keys(wordMap).length
      console.log(`Uncategorized words loaded: ${total} words`)
    } catch {
      wordMap = {}
    }
  }
}

export function trackWord(word: string, mode: 'love' | 'garbage'): void {
  const w = word.toLowerCase().trim()
  if (!w) return

  if (!wordMap[w]) {
    wordMap[w] = { love: 0, garbage: 0 }
  }
  wordMap[w][mode]++

  persist()
}

function persist(): void {
  try {
    writeFileSync(JSON_PATH(), JSON.stringify(wordMap, null, 2), 'utf8')
    writeFileSync(MD_PATH(), buildMarkdown(), 'utf8')
  } catch {
    // Silently skip if data dir doesn't exist yet
  }
}

function buildMarkdown(): string {
  const now = new Date().toLocaleString('es-AR', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const entries = Object.entries(wordMap)
  const total = entries.length

  const loveOnly = entries.filter(([, v]) => v.love > 0 && v.garbage === 0)
    .sort((a, b) => b[1].love - a[1].love)
  const garbageOnly = entries.filter(([, v]) => v.love === 0 && v.garbage > 0)
    .sort((a, b) => b[1].garbage - a[1].garbage)
  const both = entries.filter(([, v]) => v.love > 0 && v.garbage > 0)
    .sort((a, b) => (b[1].love + b[1].garbage) - (a[1].love + a[1].garbage))

  const table = (rows: [string, WordEntry][], colA: 'love' | 'garbage') =>
    rows.length === 0
      ? '*Ninguna por ahora.*'
      : `| Palabra | Veces |\n|---------|-------|\n` +
        rows.map(([w, v]) => `| ${w} | ${v[colA]} |`).join('\n')

  const bothTable = (rows: [string, WordEntry][]) =>
    rows.length === 0
      ? '*Ninguna por ahora.*'
      : `| Palabra | En Love | En Garbage |\n|---------|---------|------------|\n` +
        rows.map(([w, v]) => `| ${w} | ${v.love} | ${v.garbage} |`).join('\n')

  return `# Palabras No Clasificadas — Word Fighter

> Actualizado: ${now}
> **${total} palabra${total !== 1 ? 's' : ''} única${total !== 1 ? 's' : ''}** registrada${total !== 1 ? 's' : ''}

Estas palabras son español válido pero no están en \`love-words.txt\` ni \`garbage-words.txt\`.
Para agregar una palabra, copiala a la lista correspondiente en \`data/\` y reiniciá el servidor.

---

## ♥ Modo Love — Candidatas para \`love-words.txt\`

Palabras tipadas durante partidas de Modo Love.

${table(loveOnly, 'love')}

---

## ☠ Modo Garbage — Candidatas para \`garbage-words.txt\`

Palabras tipadas durante partidas de Modo Garbage.

${table(garbageOnly, 'garbage')}

---

## ↔ Ambos Modos

Palabras tipadas en los dos modos — revisar bien antes de clasificar.

${bothTable(both)}
`
}
