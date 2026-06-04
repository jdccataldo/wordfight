import type { BattleMode } from '@/types'
import styles from './ModeIndicator.module.css'

export default function ModeIndicator({ mode }: { mode: BattleMode }) {
  return (
    <div className={[styles.badge, mode === 'love' ? styles.love : styles.garbage].join(' ')}>
      {mode === 'love' ? '♥ MODO LOVE' : '☠ MODO GARBAGE'}
    </div>
  )
}
