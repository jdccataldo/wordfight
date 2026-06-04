'use client'

import { useEffect, useState } from 'react'
import styles from './DamageNumber.module.css'

type Props = {
  damage: number
  triggerId: number
  side: 'left' | 'right'
}

export default function DamageNumber({ damage, triggerId, side }: Props) {
  const [visible, setVisible] = useState(false)
  const [key, setKey] = useState(0)

  useEffect(() => {
    if (triggerId === 0) return
    setKey(k => k + 1)
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 900)
    return () => clearTimeout(t)
  }, [triggerId])

  if (!visible) return null

  return (
    <div
      key={key}
      className={[styles.number, side === 'left' ? styles.left : styles.right].join(' ')}
    >
      -{damage}
    </div>
  )
}
