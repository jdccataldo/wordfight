'use client'

import { useState } from 'react'
import type { BattleMode } from '@/types'
import styles from './WaitingRoom.module.css'

type Props = {
  roomId: string
  pin: string
  mode: BattleMode
  spectatorCount: number
}

export default function WaitingRoom({ roomId, pin, mode, spectatorCount }: Props) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/battle/${roomId}` : ''

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.container}>
      <div className={[styles.modeBadge, mode === 'love' ? styles.modeLove : styles.modeGarbage].join(' ')}>
        {mode === 'love' ? '♥ MODO LOVE' : '☠ MODO GARBAGE'}
      </div>

      <div className={styles.section}>
        <p className={styles.label}>COMPARTÍ EL LINK</p>
        <div className={styles.urlBox}>
          <span className={styles.url}>{url}</span>
          <button className={styles.copyBtn} onClick={copyUrl}>
            {copied ? '✓ COPIADO' : 'COPIAR'}
          </button>
        </div>
      </div>

      <div className={styles.pinSection}>
        <p className={styles.label}>PIN DEL LUCHADOR</p>
        <div className={styles.pinDisplay}>
          {pin.split('').map((digit, i) => (
            <span key={i} className={styles.pinDigit}>{digit}</span>
          ))}
        </div>
        <p className={styles.pinHint}>Solo para el rival — no lo publiques con el link</p>
      </div>

      <div className={styles.waiting}>
        <span className={styles.waitingDots}>ESPERANDO RIVAL</span>
      </div>

      {spectatorCount > 0 && (
        <div className={styles.spectators}>
          👁 {spectatorCount} espectador{spectatorCount !== 1 ? 'es' : ''}
        </div>
      )}
    </div>
  )
}
