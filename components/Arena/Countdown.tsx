'use client'

import styles from './Countdown.module.css'

type Props = {
  value: number | null
}

const labels: Record<number, string> = { 3: '3', 2: '2', 1: '1', 0: '¡PELEA!' }

export default function Countdown({ value }: Props) {
  if (value === null || value < 0) return null

  return (
    <div className={styles.overlay}>
      <span key={value} className={[styles.number, value === 0 ? styles.fight : ''].join(' ')}>
        {labels[value] ?? ''}
      </span>
    </div>
  )
}
