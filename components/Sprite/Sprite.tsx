import type { CharacterConfig } from '@/types'
import { PALETTES } from './parts/colors'
import { HEADS, BODIES, LEGS, ACCESSORIES, PIXEL_SIZE } from './parts/characters'

const SPRITE_W = 12
const HEAD_H = 7
const BODY_H = 8
const LEGS_H = 5
const SPRITE_H = HEAD_H + BODY_H + LEGS_H

function colorFor(ch: string, palette: (typeof PALETTES)[0]): string | null {
  switch (ch) {
    // Primary palette
    case 'P': return palette.primary
    case 'p': return palette.primaryShadow
    // Secondary palette
    case 'S': return palette.secondary
    case 's': return palette.secondaryShadow
    // Skin tones (universal)
    case 'K': return '#f4a261'
    case 'k': return '#c67640'
    case 'L': return '#ffd7b5'
    // Hair
    case 'H': return palette.hair
    case 'h': return palette.hairShadow
    // Misc
    case 'O': return '#1a1a2e'
    case 'W': return '#ffffff'
    case 'w': return '#cccccc'
    case 'B': return '#000000'
    case '.': return null
    default: return null
  }
}

type Props = {
  config: CharacterConfig
  flip?: boolean
  scale?: number
}

export default function Sprite({ config, flip = false, scale = 1 }: Props) {
  const palette = PALETTES[config.colorId] ?? PALETTES[0]
  const head = HEADS[config.headId] ?? HEADS[0]
  const body = BODIES[config.bodyId] ?? BODIES[0]
  const legs = LEGS[config.bodyId] ?? LEGS[0]
  const accessory = ACCESSORIES[config.accessoryId] ?? null

  const rects: React.ReactNode[] = []

  function pushLayer(grid: string[], yOffset: number) {
    grid.forEach((row, ry) => {
      for (let cx = 0; cx < row.length && cx < SPRITE_W; cx++) {
        const ch = row[cx]
        const fill = colorFor(ch, palette)
        if (!fill) continue
        rects.push(
          <rect
            key={`${yOffset}-${ry}-${cx}`}
            x={cx * PIXEL_SIZE}
            y={(yOffset + ry) * PIXEL_SIZE}
            width={PIXEL_SIZE}
            height={PIXEL_SIZE}
            fill={fill}
          />
        )
      }
    })
  }

  pushLayer(head, 0)
  pushLayer(body, HEAD_H)
  pushLayer(legs, HEAD_H + BODY_H)

  if (accessory) {
    pushLayer(accessory, 0)
  }

  const svgW = SPRITE_W * PIXEL_SIZE
  const svgH = SPRITE_H * PIXEL_SIZE
  const displayW = svgW * scale
  const displayH = svgH * scale

  return (
    <svg
      width={displayW}
      height={displayH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      style={{
        imageRendering: 'pixelated',
        transform: flip ? 'scaleX(-1)' : undefined,
      }}
      shapeRendering="crispEdges"
    >
      {rects}
    </svg>
  )
}
