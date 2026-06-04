export type ColorPalette = {
  primary: string
  primaryShadow: string
  secondary: string
  secondaryShadow: string
  hair: string
  hairShadow: string
  // skin is universal — handled in Sprite.tsx as fixed values
}

export const PALETTES: ColorPalette[] = [
  // 0 Guerrero (red/blue)
  { primary: '#e63946', primaryShadow: '#8b1a1a', secondary: '#457b9d', secondaryShadow: '#1a3a5c', hair: '#2b2d42', hairShadow: '#0d0d1a' },
  // 1 Bosque (green/purple)
  { primary: '#2ecc71', primaryShadow: '#1a7a43', secondary: '#8e44ad', secondaryShadow: '#5a1a7a', hair: '#1a1a2e', hairShadow: '#000000' },
  // 2 Océano (blue/orange)
  { primary: '#3498db', primaryShadow: '#1a5a8b', secondary: '#e67e22', secondaryShadow: '#8b4a00', hair: '#8b4513', hairShadow: '#4a200a' },
  // 3 Solar (gold/red)
  { primary: '#f39c12', primaryShadow: '#8b5500', secondary: '#e74c3c', secondaryShadow: '#8b1a1a', hair: '#1a1a2e', hairShadow: '#000000' },
  // 4 Místico (purple/teal)
  { primary: '#9b59b6', primaryShadow: '#5a1a7a', secondary: '#1abc9c', secondaryShadow: '#0a7a5a', hair: '#4a4a4a', hairShadow: '#2a2a2a' },
  // 5 Jade (teal/red)
  { primary: '#1abc9c', primaryShadow: '#0a7a5a', secondary: '#e74c3c', secondaryShadow: '#8b1a1a', hair: '#2b2d42', hairShadow: '#0d0d1a' },
  // 6 Fuego (red/gold)
  { primary: '#e74c3c', primaryShadow: '#8b1a1a', secondary: '#f1c40f', secondaryShadow: '#8b7000', hair: '#3d2b1f', hairShadow: '#1a0a00' },
  // 7 Sombra (dark/red) — ninja color
  { primary: '#2c3e50', primaryShadow: '#1a2535', secondary: '#e74c3c', secondaryShadow: '#8b1a1a', hair: '#f1c40f', hairShadow: '#8b7000' },
]

export const PALETTE_NAMES = [
  'Guerrero',
  'Bosque',
  'Océano',
  'Solar',
  'Místico',
  'Jade',
  'Fuego',
  'Sombra',
]
