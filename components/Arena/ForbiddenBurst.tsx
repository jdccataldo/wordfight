'use client'

import { useEffect, useState } from 'react'
import type { ForbiddenEvent } from '@/store/gameStore'
import styles from './ForbiddenBurst.module.css'

const LOVE_SYMBOLS = ['♥', '♡', '✿', '~', '❤', '✦']
const GARBAGE_SYMBOLS = ['@', '#', '$', '%', '!', '☠', '✕']

type Props = {
  event: ForbiddenEvent | null
}

export default function ForbiddenBurst({ event }: Props) {
  const [visible, setVisible] = useState(false)
  const [symbols, setSymbols] = useState<{ char: string; x: number; y: number; r: number }[]>([])

  useEffect(() => {
    if (!event) return
    const pool = event.symbolType === 'love' ? GARBAGE_SYMBOLS : LOVE_SYMBOLS
    const burst = Array.from({ length: 8 }, () => ({
      char: pool[Math.floor(Math.random() * pool.length)],
      x: 30 + Math.random() * 40,
      y: 20 + Math.random() * 60,
      r: Math.random() * 360,
    }))
    setSymbols(burst)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [event])

  if (!visible) return null

  return (
    <div className={styles.overlay}>
      {symbols.map((s, i) => (
        <span
          key={i}
          className={styles.symbol}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            '--rot': `${s.r}deg`,
            animationDelay: `${i * 40}ms`,
          } as React.CSSProperties}
        >
          {s.char}
        </span>
      ))}
    </div>
  )
}
