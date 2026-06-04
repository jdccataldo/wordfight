'use client'

import { useState } from 'react'
import { soundEngine } from '@/lib/soundEngine'
import styles from './MuteButton.module.css'

export default function MuteButton() {
  const [muted, setMuted] = useState(false)

  const toggle = () => {
    const next = !muted
    setMuted(next)
    soundEngine.setMuted(next)
  }

  return (
    <button
      className={styles.btn}
      onClick={toggle}
      title={muted ? 'Activar sonido' : 'Silenciar'}
      aria-label={muted ? 'Activar sonido' : 'Silenciar'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
