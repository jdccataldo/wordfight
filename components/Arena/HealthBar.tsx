import styles from './HealthBar.module.css'

type Props = {
  hp: number
  maxHp?: number
  flip?: boolean
}

export default function HealthBar({ hp, maxHp = 100, flip = false }: Props) {
  const blocks = 10
  const filledBlocks = Math.ceil((hp / maxHp) * blocks)
  const pct = hp / maxHp

  const blockColor =
    pct > 0.5 ? '#2ecc71' :
    pct > 0.25 ? '#f39c12' :
    '#e63946'

  const shadowColor =
    pct > 0.5 ? '#1a7a43' :
    pct > 0.25 ? '#8b5500' :
    '#8b1a1a'

  return (
    <div className={[styles.bar, flip ? styles.flip : ''].join(' ')}>
      {Array.from({ length: blocks }).map((_, i) => {
        const idx = flip ? blocks - 1 - i : i
        const filled = idx < filledBlocks
        return (
          <span
            key={i}
            className={[styles.block, filled ? styles.blockFilled : styles.blockEmpty].join(' ')}
            style={filled ? {
              background: blockColor,
              boxShadow: `inset -2px -2px 0 ${shadowColor}`,
            } : undefined}
          />
        )
      })}
      <span className={styles.value}>{hp}</span>
    </div>
  )
}
